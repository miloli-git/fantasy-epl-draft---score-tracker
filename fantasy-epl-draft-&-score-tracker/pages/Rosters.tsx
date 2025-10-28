import React from 'react';
import { useLeague } from '../contexts/LeagueContext';
import { useFPLData } from '../contexts/FPLDataContext';
import { Manager } from '../types';
import Loader from '../components/Loader';
import { useUI } from '../contexts/UIContext';

const Rosters: React.FC = () => {
    const { managers } = useLeague();
    const { loading: fplLoading } = useFPLData();

    if (fplLoading) {
        return <Loader text="Loading Player Data..." />;
    }
    
    if (managers.length === 0) {
        return (
             <div className="text-center py-10">
                <h2 className="text-3xl font-bold text-pl-green">Rosters</h2>
                <p className="text-gray-400 mt-2">No managers have been set up yet.</p>
                <p className="text-gray-400 mt-1">Go to the 'Setup' page to create your league.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-pl-green">League Rosters</h2>
                <p className="text-gray-400 mt-2">A complete overview of every manager's squad.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managers.map(manager => (
                    <ManagerRosterCard key={manager.id} manager={manager} />
                ))}
            </div>
        </div>
    );
};

const POS_ORDER: {[key: string]: number} = {'GKP': 1, 'DEF': 2, 'MID': 3, 'FWD': 4};

const ManagerRosterCard: React.FC<{ manager: Manager }> = ({ manager }) => {
    const { getPlayerById } = useFPLData();
    const { auctionPrices } = useLeague();
    const { showPlayerModal } = useUI();
    
    const rosterPlayers = manager.roster
        .map(id => getPlayerById(id))
        .filter(p => p !== undefined)
        .sort((a, b) => {
            const posA = POS_ORDER[a!.position_short_name] || 5;
            const posB = POS_ORDER[b!.position_short_name] || 5;
            return posA - posB;
        });

    return (
        <div className="bg-pl-purple-light p-5 rounded-lg shadow-2xl flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{manager.name}</h3>
                <p className="text-sm font-semibold text-pl-green">${manager.cash.toFixed(2)} cash</p>
            </div>
            <div className="space-y-2 flex-grow">
                {rosterPlayers.map(player => {
                    if (!player) return null;
                    const auctionPrice = auctionPrices[player.id];
                    return (
                        <div 
                            key={player.id} 
                            onClick={() => showPlayerModal(player)}
                            className="flex items-center justify-between bg-pl-purple p-2 rounded-md cursor-pointer hover:bg-opacity-80 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <span className={`w-10 text-center font-bold text-sm px-2 py-1 rounded bg-black/20 ${
                                    player.position_short_name === 'GKP' ? 'text-yellow-400' :
                                    player.position_short_name === 'DEF' ? 'text-blue-400' :
                                    player.position_short_name === 'MID' ? 'text-green-400' : 'text-red-400'
                                }`}>{player.position_short_name}</span>
                                <div>
                                    <p className="font-semibold text-sm">{player.web_name}</p>
                                    <p className="text-xs text-gray-400">{player.team_name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                               <p className="font-bold text-sm">{player.total_points}</p>
                               {auctionPrice !== undefined ? (
                                    <p className="text-xs text-pl-green">${auctionPrice} paid</p>
                               ) : (
                                    <p className="text-xs text-gray-400">Total</p>
                               )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default Rosters;