
import React, { useState } from 'react';
import { useLeague } from '../contexts/LeagueContext';
import { useFPLData } from '../contexts/FPLDataContext';
import { Manager, Player } from '../types';

const Trades: React.FC = () => {
    const { managers, setManagers } = useLeague();
    const [manager1Id, setManager1Id] = useState<string>('');
    const [manager2Id, setManager2Id] = useState<string>('');
    const [tradeOffer, setTradeOffer] = useState<{ [key: string]: { players: number[], cash: number } }>({});

    const manager1 = managers.find(m => m.id === manager1Id);
    const manager2 = managers.find(m => m.id === manager2Id);

    const handlePlayerToggle = (managerId: string, playerId: number) => {
        setTradeOffer(prev => {
            const currentPlayers = prev[managerId]?.players || [];
            const newPlayers = currentPlayers.includes(playerId)
                ? currentPlayers.filter(id => id !== playerId)
                : [...currentPlayers, playerId];
            return { ...prev, [managerId]: { ...(prev[managerId] || { cash: 0 }), players: newPlayers } };
        });
    };

    const handleCashChange = (managerId: string, amount: number) => {
        setTradeOffer(prev => ({
            ...prev,
            [managerId]: { ...(prev[managerId] || { players: [] }), cash: amount }
        }));
    };
    
    const executeTrade = () => {
        if (!manager1 || !manager2) return;

        const offer1 = tradeOffer[manager1.id] || { players: [], cash: 0 };
        const offer2 = tradeOffer[manager2.id] || { players: [], cash: 0 };

        if (manager1.cash < offer1.cash || manager2.cash < offer2.cash) {
            alert("A manager does not have enough cash for this trade.");
            return;
        }

        const newManager1Roster = manager1.roster.filter(p => !offer1.players.includes(p)).concat(offer2.players);
        const newManager2Roster = manager2.roster.filter(p => !offer2.players.includes(p)).concat(offer1.players);
        
        const newManager1Cash = manager1.cash - offer1.cash + offer2.cash;
        const newManager2Cash = manager2.cash - offer2.cash + offer1.cash;

        const updatedManagers = managers.map(m => {
            if (m.id === manager1.id) return { ...m, roster: newManager1Roster, cash: newManager1Cash };
            if (m.id === manager2.id) return { ...m, roster: newManager2Roster, cash: newManager2Cash };
            return m;
        });
        
        setManagers(updatedManagers);
        setTradeOffer({});
        alert("Trade executed successfully!");
    };
    
    const tradeIsValid = manager1 && manager2 && (
      (tradeOffer[manager1.id]?.players?.length || tradeOffer[manager1.id]?.cash > 0) || 
      (tradeOffer[manager2.id]?.players?.length || tradeOffer[manager2.id]?.cash > 0)
    );

    if (managers.length < 2) {
        return (
             <div className="text-center py-10">
                <h2 className="text-3xl font-bold text-pl-green">Trades</h2>
                <p className="text-gray-400 mt-2">You need at least two managers to make a trade.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-pl-green">Execute Trade</h2>
                <p className="text-gray-400 mt-2">Select two managers and propose a trade of players and cash.</p>
            </div>
            
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
                <ManagerSelect managers={managers} selectedId={manager1Id} onChange={setManager1Id} otherSelectedId={manager2Id} label="Manager 1"/>
                <ManagerSelect managers={managers} selectedId={manager2Id} onChange={setManager2Id} otherSelectedId={manager1Id} label="Manager 2"/>
            </div>

            {manager1 && manager2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                   <TradePanel manager={manager1} offer={tradeOffer[manager1.id]} onPlayerToggle={handlePlayerToggle} onCashChange={handleCashChange} />
                   <TradePanel manager={manager2} offer={tradeOffer[manager2.id]} onPlayerToggle={handlePlayerToggle} onCashChange={handleCashChange} />
                </div>
            )}
            
            {tradeIsValid && (
                 <div className="text-center">
                    <button onClick={executeTrade} className="bg-pl-pink text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-80 transition-all duration-200 text-lg">
                        Execute Trade
                    </button>
                </div>
            )}
        </div>
    );
};

const ManagerSelect: React.FC<{managers: Manager[], selectedId: string, onChange: (id: string) => void, otherSelectedId: string, label: string}> = ({ managers, selectedId, onChange, otherSelectedId, label }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select value={selectedId} onChange={(e) => onChange(e.target.value)} className="w-full bg-pl-purple-light border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-pl-green focus:outline-none">
            <option value="">Select Manager</option>
            {managers.filter(m => m.id !== otherSelectedId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
    </div>
);

const TradePanel: React.FC<{manager: Manager, offer: any, onPlayerToggle: Function, onCashChange: Function}> = ({manager, offer, onPlayerToggle, onCashChange}) => {
    const { getPlayerById } = useFPLData();
    return (
        <div className="bg-pl-purple-light p-5 rounded-lg shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">{manager.name}'s Offer</h3>
            <div>
                <label className="block text-sm font-medium text-gray-400">Cash</label>
                <input type="number" min="0" max={manager.cash} value={offer?.cash || 0} onChange={(e) => onCashChange(manager.id, parseFloat(e.target.value))} className="w-full mt-1 bg-pl-purple border border-gray-600 rounded-md py-1 px-2 focus:ring-1 focus:ring-pl-green focus:outline-none" />
            </div>
            <div>
                <h4 className="text-md font-semibold text-gray-300">Players</h4>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2">
                    {manager.roster.map(playerId => {
                        const player = getPlayerById(playerId);
                        const isSelected = offer?.players?.includes(playerId);
                        return player && (
                             <div key={playerId} onClick={() => onPlayerToggle(manager.id, playerId)} className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition-all ${isSelected ? 'bg-pl-green text-pl-purple' : 'bg-pl-purple hover:bg-opacity-70'}`}>
                                <div>
                                    <p className="font-semibold text-sm">{player.web_name}</p>
                                    <p className={`text-xs ${isSelected ? 'text-gray-700' : 'text-gray-400'}`}>{player.team_name}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default Trades;
