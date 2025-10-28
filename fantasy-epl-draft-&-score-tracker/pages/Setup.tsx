import React, { useState } from 'react';
import { useLeague } from '../contexts/LeagueContext';
import { useFPLData } from '../contexts/FPLDataContext';
import { Manager, Player } from '../types';
import PlayerSearch from '../components/PlayerSearch';
import Loader from '../components/Loader';
import { useUI } from '../contexts/UIContext';

// FPL Draft API endpoints (trailing slashes removed)
const PROXY_URL = 'https://corsproxy.io/?';
const API_LEAGUE_DETAILS_URL = (id: string) => `${PROXY_URL}${encodeURIComponent(`https://draft.premierleague.com/api/league/${id}/details`)}`;
const API_ELEMENT_STATUS_URL = (id: string) => `${PROXY_URL}${encodeURIComponent(`https://draft.premierleague.com/api/league/${id}/element-status`)}`;

const STARTING_BUDGET = 100;

const Setup: React.FC = () => {
    const { managers, addManager, updateManager, deleteManager, setManagers, setAuctionPrices } = useLeague();
    const { loading: fplLoading, players: allPlayers } = useFPLData();
    const [newManagerName, setNewManagerName] = useState('');
    
    // State for FPL Draft API import
    const [leagueId, setLeagueId] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importLog, setImportLog] = useState<string[]>([]);
    const [confirmingImport, setConfirmingImport] = useState(false);

    // State for Price import
    const [priceImportData, setPriceImportData] = useState('');
    const [isPriceImporting, setIsPriceImporting] = useState(false);
    const [priceImportLog, setPriceImportLog] = useState<string[]>([]);

    const handleAddManager = (e: React.FormEvent) => {
        e.preventDefault();
        if (newManagerName.trim()) {
            addManager(newManagerName.trim());
            setNewManagerName('');
        }
    };

    const addToLog = (message: string) => setImportLog(prev => [...prev, message]);

    const handleDraftImport = async () => {
        if (!leagueId.trim()) {
            alert('Please enter a League ID.');
            return;
        }

        setConfirmingImport(false);
        setIsImporting(true);
        setImportLog([]);
        addToLog("🚀 Starting FPL Draft league import...");
        
        try {
            addToLog(`Fetching league details for ID: ${leagueId}...`);
            const detailsRes = await fetch(API_LEAGUE_DETAILS_URL(leagueId));
            if (!detailsRes.ok) throw new Error(`Failed to fetch league details (Status: ${detailsRes.status})`);
            const detailsData = await detailsRes.json();
            
            const leagueEntries = detailsData.league_entries;
            if (!leagueEntries || leagueEntries.length === 0) throw new Error("No managers found in this league.");
            
            addToLog(`Found ${leagueEntries.length} managers in league "${detailsData.league.name}".`);
            
            const managerMap = new Map<number, string>();
            leagueEntries.forEach((entry: any) => {
                const managerName = `${entry.player_first_name} ${entry.player_last_name}`;
                managerMap.set(entry.entry_id, managerName);
            });
            
            addToLog("Fetching player ownership data...");
            const statusRes = await fetch(API_ELEMENT_STATUS_URL(leagueId));
            if (!statusRes.ok) throw new Error(`Failed to fetch player ownership (Status: ${statusRes.status})`);
            const statusData = await statusRes.json();
            
            const elementStatus = statusData.element_status;
            const rosters = new Map<number, number[]>();
            elementStatus.forEach((player: any) => {
                if (player.owner !== null) {
                    if (!rosters.has(player.owner)) rosters.set(player.owner, []);
                    rosters.get(player.owner)!.push(player.element);
                }
            });
            
            addToLog("Building new league rosters...");
            const newManagers: Manager[] = leagueEntries.map((entry: any) => ({
                id: entry.entry_id.toString(),
                name: managerMap.get(entry.entry_id) || 'Unknown Manager',
                cash: STARTING_BUDGET,
                roster: rosters.get(entry.entry_id) || []
            }));
            
            setManagers(newManagers);
            setAuctionPrices({}); // Clear old prices
            addToLog("✅ --- Step 1 Complete! Rosters imported. ---");
            addToLog("ℹ️ You can now optionally import auction prices below.");

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            addToLog(`❌ Error: ${errorMessage}`);
            addToLog(`ℹ️ Please check your League ID. If the error persists, the league may be private or the FPL API may be unavailable.`);
            console.error(error);
        } finally {
            setIsImporting(false);
        }
    };
    
    const handlePriceImport = () => {
        setIsPriceImporting(true);
        setPriceImportLog(['🚀 Starting price import...']);
        
        const newPrices: { [playerId: number]: number } = {};
        const rows = priceImportData.split('\n').filter(row => row.trim() !== '');
        
        rows.forEach((row, i) => {
            const [playerName, managerName, priceStr] = row.split(/[,	]/).map(s => s.trim()); // Split by comma or tab
            
            if (!playerName || !managerName || !priceStr) {
                 setPriceImportLog(prev => [...prev, `⚠️ Row ${i+1}: Skipping invalid row.`]);
                 return;
            }

            const price = parseFloat(priceStr.replace('$', ''));
             if (isNaN(price)) {
                setPriceImportLog(prev => [...prev, `⚠️ Row ${i+1}: Invalid price for ${playerName}.`]);
                return;
            }
            
            const manager = managers.find(m => m.name.toLowerCase() === managerName.toLowerCase());
            if (!manager) {
                setPriceImportLog(prev => [...prev, `❌ Row ${i+1}: Manager "${managerName}" not found.`]);
                return;
            }

            const normalizedPlayerName = playerName.toLowerCase();
            const player = allPlayers.find(p => manager.roster.includes(p.id) && (
                p.web_name.toLowerCase() === normalizedPlayerName ||
                `${p.first_name} ${p.second_name}`.toLowerCase() === normalizedPlayerName
            ));

            if (!player) {
                setPriceImportLog(prev => [...prev, `❌ Row ${i+1}: Player "${playerName}" not found in ${manager.name}'s roster.`]);
                return;
            }

            newPrices[player.id] = price;
            setPriceImportLog(prev => [...prev, `✅ Row ${i+1}: Matched ${player.web_name} to ${manager.name} for $${price}.`]);
        });

        setAuctionPrices(newPrices);

        const updatedManagers = managers.map(manager => {
            const totalSpent = manager.roster.reduce((acc, playerId) => acc + (newPrices[playerId] || 0), 0);
            return { ...manager, cash: STARTING_BUDGET - totalSpent };
        });
        setManagers(updatedManagers);

        setPriceImportLog(prev => [...prev, '✅ --- Step 2 Complete! Player prices and manager cash updated. ---']);
        setIsPriceImporting(false);
    };


    const allRosteredPlayerIds = managers.flatMap(m => m.roster);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-pl-green">League Setup</h2>
                <p className="text-gray-400 mt-2">Use the tools below to set up your league. Data is saved in your browser.</p>
            </div>

            {/* Step 1: API Import */}
            <div className="max-w-4xl mx-auto bg-pl-purple-light p-6 rounded-lg shadow-2xl space-y-4">
                <h3 className="text-xl font-bold text-white">Step 1: Import from FPL Draft League</h3>
                <p className="text-gray-400 text-sm">
                    Enter your league ID to automatically import all managers and rosters.
                    Find your ID in your league URL (e.g., .../leagues/ID/standings/c).
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                    <input type="text" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} placeholder="e.g., 33917" className="flex-grow bg-pl-purple border border-gray-600 rounded-md py-2 px-4 focus:ring-2 focus:ring-pl-green focus:outline-none" disabled={isImporting || confirmingImport} />
                     {!confirmingImport ? (
                        <button onClick={() => setConfirmingImport(true)} disabled={isImporting || fplLoading} className="bg-pl-pink text-white font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed w-full sm:w-auto">
                            {isImporting ? 'Importing...' : 'Import League'}
                        </button>
                    ) : (
                         <div className="flex items-center space-x-2 sm:space-x-4">
                            <p className="text-sm text-yellow-400">This will overwrite existing data.</p>
                            <button onClick={handleDraftImport} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors">Confirm</button>
                            <button onClick={() => setConfirmingImport(false)} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
                        </div>
                    )}
                </div>
                 {importLog.length > 0 && (
                    <div className="bg-pl-purple p-4 rounded-md mt-4 max-h-48 overflow-y-auto">
                        <ul className="text-xs text-gray-400 font-mono space-y-1">
                           {importLog.map((msg, i) => <li key={i}>{msg}</li>)}
                        </ul>
                    </div>
                )}
            </div>
            
            {/* Step 2: Price Import */}
            {managers.length > 0 && (
                <div className="max-w-4xl mx-auto bg-pl-purple-light p-6 rounded-lg shadow-2xl space-y-4">
                     <h3 className="text-xl font-bold text-white">Step 2 (Optional): Import Auction Prices</h3>
                     <p className="text-gray-400 text-sm">
                        Paste your auction data from a spreadsheet. The app will match players to managers, store their auction price, and calculate remaining cash from a ${STARTING_BUDGET} budget.
                     </p>
                     <p className="text-gray-400 text-xs font-mono">Format: Player Name, Manager Name, Price</p>
                     <textarea
                        value={priceImportData}
                        onChange={(e) => setPriceImportData(e.target.value)}
                        placeholder={'e.g.\nSalah, My Team, 55\nDe Bruyne, Another Team, 52'}
                        className="w-full h-32 bg-pl-purple border border-gray-600 rounded-md py-2 px-4 focus:ring-2 focus:ring-pl-green focus:outline-none font-mono text-sm"
                        disabled={isPriceImporting}
                     />
                     <button onClick={handlePriceImport} disabled={isPriceImporting || !priceImportData} className="bg-pl-green text-pl-purple font-bold py-2 px-6 rounded-md hover:bg-white transition-all duration-200 disabled:bg-gray-500 disabled:text-gray-800 disabled:cursor-not-allowed">
                        {isPriceImporting ? 'Importing Prices...' : 'Import Prices & Calculate Cash'}
                     </button>
                     {priceImportLog.length > 0 && (
                        <div className="bg-pl-purple p-4 rounded-md mt-4 max-h-48 overflow-y-auto">
                            <ul className="text-xs text-gray-400 font-mono space-y-1">
                                {priceImportLog.map((msg, i) => <li key={i}>{msg}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Manager Section */}
            <div className="max-w-md mx-auto bg-pl-purple-light p-6 rounded-lg shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Add Manager Manually</h3>
                <form onSubmit={handleAddManager} className="flex space-x-2">
                    <input type="text" value={newManagerName} onChange={(e) => setNewManagerName(e.target.value)} placeholder="New Manager Name" className="flex-grow bg-pl-purple border border-gray-600 rounded-md py-2 px-4 focus:ring-2 focus:ring-pl-green focus:outline-none" />
                    <button type="submit" className="bg-pl-green text-pl-purple font-bold py-2 px-4 rounded-md hover:bg-white transition-colors duration-200">Add</button>
                </form>
            </div>

            {fplLoading ? <Loader text="Loading FPL Data..." /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managers.map(manager => (
                        <ManagerSetupCard key={manager.id} manager={manager} updateManager={updateManager} deleteManager={deleteManager} allPlayers={allPlayers} allRosteredPlayerIds={allRosteredPlayerIds} />
                    ))}
                </div>
            )}
        </div>
    );
};


interface ManagerSetupCardProps {
    manager: Manager;
    updateManager: (manager: Manager) => void;
    deleteManager: (id: string) => void;
    allPlayers: Player[];
    allRosteredPlayerIds: number[];
}

const ManagerSetupCard: React.FC<ManagerSetupCardProps> = ({ manager, updateManager, deleteManager, allPlayers, allRosteredPlayerIds }) => {
    const { getPlayerById } = useFPLData();
    const { showPlayerModal } = useUI();

    const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateManager({ ...manager, cash: parseFloat(e.target.value) || 0 });
    };

    const addPlayerToRoster = (player: Player) => {
        if (!manager.roster.includes(player.id)) {
            updateManager({ ...manager, roster: [...manager.roster, player.id] });
        }
    };
    
    const removePlayerFromRoster = (playerId: number) => {
        updateManager({ ...manager, roster: manager.roster.filter(id => id !== playerId) });
    };
    
    const availablePlayers = allPlayers.filter(p => !allRosteredPlayerIds.includes(p.id) || manager.roster.includes(p.id));

    return (
        <div className="bg-pl-purple-light p-5 rounded-lg shadow-2xl flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{manager.name}</h3>
                <button onClick={() => deleteManager(manager.id)} className="text-pl-pink hover:text-red-400 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400">Cash Balance (for trades)</label>
                <div className="mt-1 flex items-center">
                    <span className="text-gray-400 mr-2">$</span>
                    <input type="number" value={manager.cash.toFixed(2)} onChange={handleCashChange} className="w-full bg-pl-purple border border-gray-600 rounded-md py-1 px-2 focus:ring-1 focus:ring-pl-green focus:outline-none" />
                </div>
            </div>
            
            <div>
                 <PlayerSearch players={availablePlayers} onSelectPlayer={addPlayerToRoster} existingRosterIds={manager.roster} />
            </div>

            <div className="flex-grow space-y-2 overflow-y-auto max-h-72 pr-2">
                <h4 className="text-md font-semibold text-gray-300">Roster ({manager.roster.length})</h4>
                {manager.roster.length === 0 ? (
                    <p className="text-gray-500 text-sm">No players added yet.</p>
                ) : (
                    manager.roster.map(playerId => {
                        const player = getPlayerById(playerId);
                        if (!player) return null;
                        return (
                             <div 
                                key={playerId} 
                                onClick={() => showPlayerModal(player)}
                                className="flex justify-between items-center bg-pl-purple p-2 rounded-md cursor-pointer hover:bg-opacity-80 transition-colors"
                            >
                                <div>
                                    <p className="font-semibold text-sm">{player.web_name}</p>
                                    <p className="text-xs text-gray-400">{player.team_name}</p>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent modal from opening when deleting
                                        removePlayerFromRoster(playerId);
                                    }} 
                                    className="text-pl-pink hover:text-red-400 p-1"
                                    aria-label={`Remove ${player.web_name}`}
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);

export default Setup;