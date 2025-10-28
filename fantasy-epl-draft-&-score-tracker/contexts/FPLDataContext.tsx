import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { FPLBootstrap, Player, FPLTeam, FPLPosition, FPLGameweek } from '../types';

interface FPLDataContextType {
    players: Player[];
    teams: FPLTeam[];
    positions: FPLPosition[];
    gameweeks: FPLGameweek[];
    loading: boolean;
    error: string | null;
    currentGameweek: FPLGameweek | null;
    getPlayerById: (id: number) => Player | undefined;
    refreshData: () => Promise<void>;
}

const FPLDataContext = createContext<FPLDataContextType>({
    players: [],
    teams: [],
    positions: [],
    gameweeks: [],
    loading: true,
    error: null,
    currentGameweek: null,
    getPlayerById: () => undefined,
    refreshData: async () => {},
});

export const useFPLData = () => useContext(FPLDataContext);

// Switched to a more reliable proxy to fix fetch errors
const PROXY_URL = 'https://corsproxy.io/?';
const API_URL = `${PROXY_URL}${encodeURIComponent('https://fantasy.premierleague.com/api/bootstrap-static/')}`;
const FPL_BOOTSTRAP_CACHE_KEY = 'fplBootstrapCache';
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour in milliseconds


export const FPLDataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [data, setData] = useState<Omit<FPLDataContextType, 'getPlayerById' | 'refreshData'>>({
        players: [],
        teams: [],
        positions: [],
        gameweeks: [],
        loading: true,
        error: null,
        currentGameweek: null,
    });

    const processAndSetData = (bootstrapData: FPLBootstrap) => {
        const teamsMap = new Map(bootstrapData.teams.map(t => [t.id, t]));
        const positionsMap = new Map(bootstrapData.element_types.map(p => [p.id, p]));

        const enrichedPlayers: Player[] = bootstrapData.elements.map(p => ({
            ...p,
            team_name: teamsMap.get(p.team)?.name || 'Unknown',
            team_short_name: teamsMap.get(p.team)?.short_name || 'UNK',
            position_short_name: positionsMap.get(p.element_type)?.singular_name_short || 'UNK',
        }));
        
        const currentGameweek = bootstrapData.events.find(gw => gw.is_current) || null;

        setData({
            players: enrichedPlayers,
            teams: bootstrapData.teams,
            positions: bootstrapData.element_types,
            gameweeks: bootstrapData.events,
            currentGameweek,
            loading: false,
            error: null,
        });
    }

    const fetchData = useCallback(async (forceRefresh = false) => {
        setData(prev => ({ ...prev, loading: true, error: null }));

        if (!forceRefresh) {
            try {
                const cachedItem = localStorage.getItem(FPL_BOOTSTRAP_CACHE_KEY);
                if (cachedItem) {
                    const { timestamp, data: cachedData } = JSON.parse(cachedItem);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        processAndSetData(cachedData);
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to read from cache", error);
            }
        }
        
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch FPL data. Status: ${response.status}`);
            }
            const bootstrapData: FPLBootstrap = await response.json();
            
            processAndSetData(bootstrapData);
            
            localStorage.setItem(FPL_BOOTSTRAP_CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: bootstrapData
            }));

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setData(prev => ({ ...prev, error: errorMessage, loading: false }));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refreshData = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    const getPlayerById = useMemo(() => (id: number) => data.players.find(p => p.id === id), [data.players]);

    return (
        <FPLDataContext.Provider value={{...data, getPlayerById, refreshData }}>
            {children}
        </FPLDataContext.Provider>
    );
};