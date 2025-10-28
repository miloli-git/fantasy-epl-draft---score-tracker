
import React, { useMemo, useState } from 'react';
import { useLeague } from '../contexts/LeagueContext';
import { useFPLData } from '../contexts/FPLDataContext';
import Loader from '../components/Loader';
import { useUI } from '../contexts/UIContext';

const ManagerTeamDetails: React.FC<{ managerId: string }> = ({ managerId }) => {
    const { managers } = useLeague();
    const { getPlayerById } = useFPLData();
    const { showPlayerModal } = useUI();

    const manager = managers.find(m => m.id === managerId);
    if (!manager) return null;

    return (
        <div className="space-y-2">
            <h4 className="text-md font-bold text-pl-green">Gameweek Squad</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {manager.roster.map(playerId => {
                    const player = getPlayerById(playerId);
                    if (!player) return null;
                    return (
                        <div key={playerId} onClick={() => showPlayerModal(player)} className="bg-pl-purple-light p-2 rounded-md cursor-pointer hover:bg-pl-purple-light/50 transition-colors text-center">
                            <p className="font-semibold text-sm truncate">{player.web_name}</p>
                            <p className="text-xs text-gray-400">{player.team_short_name}</p>
                            <p className="font-bold text-lg">{player.event_points}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const Leaderboard: React.FC = () => {
    const { managers } = useLeague();
    const { getPlayerById, loading: fplLoading, currentGameweek } = useFPLData();
    const [expandedManagerId, setExpandedManagerId] = useState<string | null>(null);

    const leaderboardData = useMemo(() => {
        return managers.map(manager => {
            let weeklyScore = 0;
            let totalScore = 0;

            manager.roster.forEach(playerId => {
                const player = getPlayerById(playerId);
                if (player) {
                    weeklyScore += player.event_points;
                    totalScore += player.total_points;
                }
            });
            return { id: manager.id, name: manager.name, weeklyScore, totalScore };
        }).sort((a, b) => b.totalScore - a.totalScore);
    }, [managers, getPlayerById]);

    if (fplLoading) {
        return <Loader text="Loading FPL Data..." />;
    }

    if (managers.length === 0) {
        return (
             <div className="text-center py-10">
                <h2 className="text-3xl font-bold text-pl-green">Leaderboard</h2>
                <p className="text-gray-400 mt-2">No managers have been set up yet.</p>
                <p className="text-gray-400 mt-1">Go to the 'Setup' page to create your league.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-pl-green">Leaderboard</h2>
                <p className="text-gray-400 mt-2">
                    {currentGameweek ? `Scores for ${currentGameweek.name}` : 'Live scores and season totals.'}
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-pl-purple-light p-4 sm:p-6 rounded-lg shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Rank</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">Manager</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Weekly Points</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Total Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {leaderboardData.map((data, index) => (
                                <React.Fragment key={data.id}>
                                    <tr 
                                        onClick={() => setExpandedManagerId(expandedManagerId === data.id ? null : data.id)}
                                        className="hover:bg-pl-purple transition-colors cursor-pointer"
                                    >
                                        <td className="p-3 text-lg font-bold text-center">
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto ${
                                                index === 0 ? 'bg-yellow-500 text-black' : 
                                                index === 1 ? 'bg-gray-400 text-black' :
                                                index === 2 ? 'bg-yellow-700 text-white' : 'bg-pl-purple'
                                            }`}>{index + 1}</span>
                                        </td>
                                        <td className="p-3 font-bold text-lg">{data.name}</td>
                                        <td className="p-3 text-center text-lg">{data.weeklyScore}</td>
                                        <td className="p-3 text-center text-xl font-extrabold text-pl-green">{data.totalScore}</td>
                                    </tr>
                                    {expandedManagerId === data.id && (
                                         <tr>
                                            <td colSpan={4} className="p-2 sm:p-4 bg-pl-purple">
                                                <ManagerTeamDetails managerId={data.id} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;