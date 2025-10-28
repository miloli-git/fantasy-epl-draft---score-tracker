
import React, { useMemo, useState, useEffect } from 'react';
import { useLeague } from '../contexts/LeagueContext';
import { useFPLData } from '../contexts/FPLDataContext';
import Loader from '../components/Loader';
import { useUI } from '../contexts/UIContext';

const PROXY_URL = 'https://corsproxy.io/?';

interface LineupData {
    starters: number[];
    bench: number[];
}

const ManagerTeamDetails: React.FC<{ managerId: string; lineup: LineupData | null }> = ({ managerId, lineup }) => {
    const { managers } = useLeague();
    const { getPlayerById } = useFPLData();
    const { showPlayerModal } = useUI();

    const manager = managers.find(m => m.id === managerId);
    if (!manager) return null;

    const starters = lineup ? lineup.starters : manager.roster;
    const bench = lineup ? lineup.bench : [];

    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-md font-bold text-pl-green mb-2">Starting XI</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {starters.map(playerId => {
                        const player = getPlayerById(playerId);
                        if (!player) return null;
                        return (
                            <div key={playerId} onClick={() => showPlayerModal(player)} className="bg-pl-purple-light p-2 rounded-md cursor-pointer hover:bg-pl-purple-light/50 transition-colors text-center border-2 border-pl-green">
                                <p className="font-semibold text-sm truncate">{player.web_name}</p>
                                <p className="text-xs text-gray-400">{player.team_short_name}</p>
                                <p className="font-bold text-lg text-pl-green">{player.event_points}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
            {bench.length > 0 && (
                <div>
                    <h4 className="text-md font-bold text-gray-400 mb-2">Bench</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {bench.map(playerId => {
                            const player = getPlayerById(playerId);
                            if (!player) return null;
                            return (
                                <div key={playerId} onClick={() => showPlayerModal(player)} className="bg-pl-purple p-2 rounded-md cursor-pointer hover:bg-pl-purple/50 transition-colors text-center opacity-60">
                                    <p className="font-semibold text-sm truncate">{player.web_name}</p>
                                    <p className="text-xs text-gray-400">{player.team_short_name}</p>
                                    <p className="font-bold text-lg text-gray-500">{player.event_points}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};


const Leaderboard: React.FC = () => {
    const { managers, gameweekLineups, setGameweekLineups, leagueId } = useLeague();
    const { getPlayerById, loading: fplLoading, currentGameweek } = useFPLData();
    const [expandedManagerId, setExpandedManagerId] = useState<string | null>(null);
    const [lineupsLoading, setLineupsLoading] = useState(false);
    const [lineupData, setLineupData] = useState<{ [managerId: string]: LineupData }>({});

    // Fetch lineup data for current gameweek
    useEffect(() => {
        if (!currentGameweek || !leagueId) return;

        const fetchLineups = async () => {
            setLineupsLoading(true);
            const newLineupData: { [managerId: string]: LineupData } = {};

            for (const manager of managers) {
                if (!manager.entryId) continue;

                // Check if we already have cached lineup data
                if (gameweekLineups[manager.id]?.[currentGameweek.id]) {
                    const cached = gameweekLineups[manager.id][currentGameweek.id];
                    newLineupData[manager.id] = cached;
                    continue;
                }

                try {
                    const url = `${PROXY_URL}${encodeURIComponent(`https://draft.premierleague.com/api/entry/${manager.entryId}/event/${currentGameweek.id}`)}`;
                    const response = await fetch(url);
                    if (!response.ok) continue;

                    const data = await response.json();
                    const picks = data.picks || [];

                    // Positions 1-11 are starters, 12-15 are bench
                    const starters = picks
                        .filter((pick: any) => pick.position <= 11)
                        .map((pick: any) => pick.element);
                    const bench = picks
                        .filter((pick: any) => pick.position > 11)
                        .map((pick: any) => pick.element);

                    newLineupData[manager.id] = { starters, bench };

                    // Cache this lineup
                    setGameweekLineups(prev => ({
                        ...prev,
                        [manager.id]: {
                            ...(prev[manager.id] || {}),
                            [currentGameweek.id]: { starters, bench }
                        }
                    }));

                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`Failed to fetch lineup for ${manager.name}:`, error);
                }
            }

            setLineupData(newLineupData);
            setLineupsLoading(false);
        };

        fetchLineups();
    }, [currentGameweek, managers, leagueId]);

    const leaderboardData = useMemo(() => {
        return managers.map(manager => {
            let weeklyScore = 0;
            let totalScore = 0;

            // Use lineup data if available (only count starters)
            const lineup = lineupData[manager.id];
            const playersToScore = lineup ? lineup.starters : manager.roster;

            playersToScore.forEach(playerId => {
                const player = getPlayerById(playerId);
                if (player) {
                    weeklyScore += player.event_points;
                }
            });

            // For total score, we need to sum all historical gameweek scores (only starters per week)
            // For now, use the simple sum of all roster players' total points
            // TODO: Calculate accurate total by fetching all historical lineups
            manager.roster.forEach(playerId => {
                const player = getPlayerById(playerId);
                if (player) {
                    totalScore += player.total_points;
                }
            });

            return { id: manager.id, name: manager.name, weeklyScore, totalScore };
        }).sort((a, b) => b.totalScore - a.totalScore);
    }, [managers, getPlayerById, lineupData]);

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
                {leagueId && lineupsLoading && (
                    <p className="text-yellow-400 text-sm mt-1">Loading lineup data...</p>
                )}
                {leagueId && !lineupsLoading && Object.keys(lineupData).length > 0 && (
                    <p className="text-pl-green text-sm mt-1">✓ Scoring based on starting lineups only</p>
                )}
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
                                                <ManagerTeamDetails managerId={data.id} lineup={lineupData[data.id] || null} />
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