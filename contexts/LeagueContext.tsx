import React, { createContext, useState, useEffect, useContext } from 'react';
import { Manager, HistoricalData, GameweekLineup } from '../types';

interface LeagueContextType {
    managers: Manager[];
    setManagers: React.Dispatch<React.SetStateAction<Manager[]>>;
    addManager: (name: string) => void;
    updateManager: (updatedManager: Manager) => void;
    deleteManager: (managerId: string) => void;
    historicalScores: HistoricalData;
    addHistoricalScores: (playerId: number, scores: { [gameweek: number]: number }) => void;
    auctionPrices: { [playerId: number]: number };
    setAuctionPrices: (prices: { [playerId: number]: number }) => void;
    gameweekLineups: GameweekLineup;
    setGameweekLineups: React.Dispatch<React.SetStateAction<GameweekLineup>>;
    leagueId: string | null;
    setLeagueId: (id: string) => void;
    isInitialized: boolean;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export const useLeague = () => {
    const context = useContext(LeagueContext);
    if (!context) {
        throw new Error('useLeague must be used within a LeagueProvider');
    }
    return context;
};

const LEAGUE_STATE_KEY = 'fplDraftLeagueState';

export const LeagueProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [historicalScores, setHistoricalScores] = useState<HistoricalData>({});
    const [auctionPrices, setAuctionPrices] = useState<{ [playerId: number]: number }>({});
    const [gameweekLineups, setGameweekLineups] = useState<GameweekLineup>({});
    const [leagueId, setLeagueId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem(LEAGUE_STATE_KEY);
            if (savedState) {
                const {
                    managers: savedManagers,
                    historicalScores: savedScores,
                    auctionPrices: savedPrices,
                    gameweekLineups: savedLineups,
                    leagueId: savedLeagueId
                } = JSON.parse(savedState);
                setManagers(savedManagers || []);
                setHistoricalScores(savedScores || {});
                setAuctionPrices(savedPrices || {});
                setGameweekLineups(savedLineups || {});
                setLeagueId(savedLeagueId || null);
            }
        } catch (error) {
            console.error("Failed to load league state from localStorage", error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialized) {
            try {
                const stateToSave = JSON.stringify({
                    managers,
                    historicalScores,
                    auctionPrices,
                    gameweekLineups,
                    leagueId
                });
                localStorage.setItem(LEAGUE_STATE_KEY, stateToSave);
            } catch (error) {
                console.error("Failed to save league state to localStorage", error);
            }
        }
    }, [managers, historicalScores, auctionPrices, gameweekLineups, leagueId, isInitialized]);
    

    const addManager = (name: string) => {
        const newManager: Manager = {
            id: Date.now().toString(),
            name,
            cash: 100, // Default starting cash
            roster: [],
        };
        setManagers(prev => [...prev, newManager]);
    };

    const updateManager = (updatedManager: Manager) => {
        setManagers(prev => prev.map(m => m.id === updatedManager.id ? updatedManager : m));
    };


    const deleteManager = (managerId: string) => {
        setManagers(prev => prev.filter(m => m.id !== managerId));
    };

    const addHistoricalScores = (playerId: number, scores: { [gameweek: number]: number }) => {
        setHistoricalScores(prev => ({
            ...prev,
            [playerId]: {
                ...(prev[playerId] || {}),
                ...scores
            }
        }));
    };

    return (
        <LeagueContext.Provider value={{
            managers,
            setManagers,
            addManager,
            updateManager,
            deleteManager,
            historicalScores,
            addHistoricalScores,
            auctionPrices,
            setAuctionPrices,
            gameweekLineups,
            setGameweekLineups,
            leagueId,
            setLeagueId,
            isInitialized
        }}>
            {children}
        </LeagueContext.Provider>
    );
};