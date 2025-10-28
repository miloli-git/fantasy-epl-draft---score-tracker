import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLeague } from '../contexts/LeagueContext';
import { useFPLData } from '../contexts/FPLDataContext';
import Loader from '../components/Loader';


// Use our backend API proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_PLAYER_SUMMARY_URL = (id: number) => `${API_BASE_URL}/api/element-summary/${id}`;

const SortIndicator = ({ sortConfig, columnKey }: { sortConfig: {key:string, direction:string} | null, columnKey: string }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
        return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 text-gray-500 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg>;
    }
    if (sortConfig.direction === 'ascending') {
        return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 ml-1 text-pl-green inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 ml-1 text-pl-green inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
};


const History: React.FC = () => {
    const { managers, historicalScores, addHistoricalScores } = useLeague();
    const { gameweeks, loading: fplLoading } = useFPLData();
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'gameweek', direction: 'ascending' });

    const availableGameweeks = useMemo(() => {
        return gameweeks
            .filter(gw => gw.finished || gw.is_current)
            .sort((a,b) => a.id - b.id);
    }, [gameweeks]);

    const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
    
    const allPlayerIds = useMemo(() => {
        const ids = new Set<number>();
        managers.forEach(m => m.roster.forEach(id => ids.add(id)));
        return Array.from(ids);
    }, [managers]);
    
    const fetchHistory = useCallback(async () => {
        const playersToFetch = allPlayerIds.filter(id => {
            const lastFetchedWeek = Math.max(0, ...Object.keys(historicalScores[id] || {}).map(Number));
            const currentWeekId = gameweeks.find(gw => gw.is_current)?.id;
            return !historicalScores[id] || (currentWeekId && lastFetchedWeek < currentWeekId);
        });
        
        if (playersToFetch.length === 0) return;

        setLoadingHistory(true);
        for (const playerId of playersToFetch) {
            try {
                const res = await fetch(API_PLAYER_SUMMARY_URL(playerId));
                if (!res.ok) continue;
                const data = await res.json();
                const playerScores: { [gameweek: number]: number } = {};
                data.history.forEach((gw: any) => {
                    playerScores[gw.round] = gw.total_points;
                });
                addHistoricalScores(playerId, playerScores);
                await new Promise(r => setTimeout(r, 50));
            } catch (error) {
                console.error(`Failed to fetch history for player ${playerId}`, error);
            }
        }
        setLoadingHistory(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allPlayerIds.join(','), gameweeks]);

    useEffect(() => {
        if (!fplLoading && allPlayerIds.length > 0) {
            fetchHistory();
        }
    }, [fplLoading, fetchHistory, allPlayerIds.length]);

    useEffect(() => {
        // Default to having weeks 1-3 deselected ("greyed out")
        if (availableGameweeks.length > 0) {
            setSelectedWeeks(availableGameweeks.map(gw => gw.id).filter(id => id > 3));
        }
    }, [availableGameweeks]);

    const handleWeekToggle = (weekId: number) => {
        setSelectedWeeks(prev => prev.includes(weekId) ? prev.filter(id => id !== weekId) : [...prev, weekId]);
    };
    
    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const weeklyScoresData = useMemo(() => {
        return availableGameweeks.map(gw => {
            const entry: { [key: string]: number | string } = {
                gameweek: gw.id,
            };
            let highestScore = 0;
            let weeklyTotal = 0;
            managers.forEach(manager => {
                const weeklyScore = manager.roster.reduce((total, playerId) => {
                    const historicalPoint = historicalScores[playerId]?.[gw.id] || 0;
                    return total + historicalPoint;
                }, 0);
                entry[manager.name] = weeklyScore;
                weeklyTotal += weeklyScore;
                if (weeklyScore > highestScore) {
                    highestScore = weeklyScore;
                }
            });
            entry.weeklyTotal = weeklyTotal;
            entry.highestScore = highestScore > 0 ? highestScore : -1; // Avoid highlighting 0
            return entry;
        });
    }, [availableGameweeks, managers, historicalScores]);

    const sortedAndFilteredData = useMemo(() => {
        let sortableData = weeklyScoresData.filter(row => selectedWeeks.includes(row.gameweek as number));

        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [weeklyScoresData, selectedWeeks, sortConfig]);

    const columnTotals = useMemo(() => {
        const managerTotals: { [key: string]: number } = {};
        managers.forEach(m => managerTotals[m.name] = 0);
        let grandTotal = 0;
        
        sortedAndFilteredData.forEach(row => {
            managers.forEach(manager => {
                managerTotals[manager.name] += row[manager.name] as number;
            });
            grandTotal += row.weeklyTotal as number;
        });
        
        return { managerTotals, grandTotal };
    }, [sortedAndFilteredData, managers]);

    if (fplLoading) return <Loader text="Loading FPL Data..." />;
    if (managers.length === 0) {
        return (
             <div className="text-center py-10">
                <h2 className="text-3xl font-bold text-pl-green">Historical Performance</h2>
                <p className="text-gray-400 mt-2">No managers have been set up yet.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-pl-green">Historical Performance</h2>
                <p className="text-gray-400 mt-2">Weekly score breakdown and totals for selected gameweeks.</p>
            </div>
            
            <div className="max-w-6xl mx-auto bg-pl-purple-light p-4 sm:p-6 rounded-lg shadow-2xl">
                <h3 className="text-lg font-semibold mb-4">Select Gameweeks to Display:</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                    {availableGameweeks.map(gw => (
                        <button 
                            key={gw.id} 
                            onClick={() => handleWeekToggle(gw.id)}
                            className={`px-3 py-1 text-sm rounded-full transition-all ${selectedWeeks.includes(gw.id) ? 'bg-pl-green text-pl-purple font-bold' : 'bg-pl-purple hover:bg-opacity-70'}`}
                        >
                            {gw.name.replace("Gameweek", "GW")}
                        </button>
                    ))}
                </div>
                {loadingHistory && <Loader text="Fetching player histories..." />}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead className="border-b-2 border-gray-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold tracking-wide cursor-pointer w-28" onClick={() => requestSort('gameweek')}>
                                    Gameweek <SortIndicator sortConfig={sortConfig} columnKey="gameweek" />
                                </th>
                                {managers.map(manager => (
                                    <th key={manager.id} className="p-3 text-sm font-semibold tracking-wide text-center cursor-pointer" onClick={() => requestSort(manager.name)}>
                                        {manager.name} <SortIndicator sortConfig={sortConfig} columnKey={manager.name} />
                                    </th>
                                ))}
                                 <th className="p-3 text-sm font-semibold tracking-wide text-center cursor-pointer" onClick={() => requestSort('weeklyTotal')}>
                                    Weekly Total <SortIndicator sortConfig={sortConfig} columnKey="weeklyTotal" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                           {sortedAndFilteredData.map((row) => (
                                <tr 
                                    key={row.gameweek}
                                    className="hover:bg-pl-purple transition-colors border-b border-gray-800"
                                >
                                    <td className="p-3 font-bold text-center">
                                        GW {row.gameweek}
                                    </td>
                                    {managers.map(manager => (
                                        <td key={manager.id} className={`p-3 text-center font-semibold text-lg ${row[manager.name] === row.highestScore ? 'text-pl-green font-extrabold' : ''}`}>
                                            {row[manager.name]}
                                        </td>
                                    ))}
                                    <td className="p-3 text-center font-semibold text-lg text-gray-300">
                                        {row.weeklyTotal}
                                    </td>
                                </tr>
                           ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-700">
                             <tr className="bg-pl-purple">
                                <th className="p-3 text-md font-bold text-left">Total</th>
                                {managers.map(manager => (
                                    <td key={manager.id} className="p-3 text-center text-xl font-extrabold text-pl-green">
                                        {columnTotals.managerTotals[manager.name]}
                                    </td>
                                ))}
                                <td className="p-3 text-center text-xl font-extrabold text-gray-300">
                                    {columnTotals.grandTotal}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;