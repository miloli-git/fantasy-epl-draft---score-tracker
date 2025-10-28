
import React, { createContext, useContext } from 'react';
import { Player } from '../types';

interface UIContextType {
    showPlayerModal: (player: Player) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export default UIContext;
