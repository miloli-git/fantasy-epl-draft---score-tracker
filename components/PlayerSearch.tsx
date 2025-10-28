
import React, { useState, useMemo } from 'react';
import { Player } from '../types';

interface PlayerSearchProps {
    players: Player[];
    onSelectPlayer: (player: Player) => void;
    existingRosterIds?: number[];
    placeholder?: string;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({ players, onSelectPlayer, existingRosterIds = [], placeholder="Search for a player..." }) => {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);

    const filteredPlayers = useMemo(() => {
        if (!query) return [];
        return players.filter(p =>
            !existingRosterIds.includes(p.id) &&
            (`${p.first_name} ${p.second_name}`).toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);
    }, [query, players, existingRosterIds]);

    const handleSelect = (player: Player) => {
        onSelectPlayer(player);
        setQuery('');
        setShowResults(false);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder={placeholder}
                className="w-full bg-pl-purple-light border border-gray-600 rounded-md py-2 px-4 focus:ring-2 focus:ring-pl-green focus:outline-none"
            />
            {showResults && filteredPlayers.length > 0 && (
                <ul className="absolute z-10 w-full bg-pl-purple-light border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredPlayers.map(player => (
                        <li
                            key={player.id}
                            onClick={() => handleSelect(player)}
                            className="px-4 py-2 hover:bg-pl-green hover:text-pl-purple cursor-pointer flex justify-between items-center"
                        >
                            <span>{player.first_name} {player.second_name} ({player.team_short_name})</span>
                            <span className="text-xs text-gray-400">{player.position_short_name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PlayerSearch;
