
import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Setup from './pages/Setup';
import Rosters from './pages/Rosters';
import Leaderboard from './pages/Leaderboard';
import Trades from './pages/Trades';
import History from './pages/History';
import { LeagueProvider } from './contexts/LeagueContext';
import { FPLDataProvider, useFPLData } from './contexts/FPLDataContext';
import UIContext from './contexts/UIContext';
import { Player } from './types';
import PlayerDetailModal from './components/PlayerDetailModal';


const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const showPlayerModal = (player: Player) => {
        setSelectedPlayer(player);
    };

    const closePlayerModal = () => {
        setSelectedPlayer(null);
    };

    return (
        <UIContext.Provider value={{ showPlayerModal }}>
            {children}
            {selectedPlayer && <PlayerDetailModal player={selectedPlayer} onClose={closePlayerModal} />}
        </UIContext.Provider>
    );
};


const App: React.FC = () => {
    return (
        <FPLDataProvider>
        <LeagueProvider>
            <UIProvider>
                <HashRouter>
                    <div className="min-h-screen bg-gradient-to-br from-pl-purple to-black font-sans">
                        <Header />
                        <main className="p-4 sm:p-6 md:p-8">
                            <Routes>
                                <Route path="/" element={<Leaderboard />} />
                                <Route path="/setup" element={<Setup />} />
                                <Route path="/rosters" element={<Rosters />} />
                                <Route path="/trades" element={<Trades />} />
                                <Route path="/history" element={<History />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </HashRouter>
            </UIProvider>
        </LeagueProvider>
        </FPLDataProvider>
    );
};

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { loading, refreshData } = useFPLData();

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive 
            ? 'bg-pl-green text-pl-purple' 
            : 'text-gray-300 hover:bg-pl-purple-light hover:text-white'
        }`;

    return (
        <header className="bg-pl-purple-light/80 backdrop-blur-sm shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <h1 className="text-2xl font-bold text-pl-green">FPL Draft</h1>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center ml-10 space-x-4">
                            <nav className="flex items-baseline space-x-4">
                                <NavLink to="/" className={navLinkClass}>Leaderboard</NavLink>
                                <NavLink to="/rosters" className={navLinkClass}>Rosters</NavLink>
                                <NavLink to="/trades" className={navLinkClass}>Trades</NavLink>
                                <NavLink to="/history" className={navLinkClass}>History</NavLink>
                                <NavLink to="/setup" className={navLinkClass}>Setup</NavLink>
                            </nav>
                            <button
                              onClick={refreshData}
                              disabled={loading}
                              className="p-2 rounded-full text-gray-300 hover:bg-pl-purple hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Refresh FPL data"
                            >
                                <span className="sr-only">Refresh FPL Data</span>
                                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                    <div className="md:hidden flex items-center">
                         <button
                              onClick={refreshData}
                              disabled={loading}
                              className="p-2 mr-2 rounded-full text-gray-300 hover:bg-pl-purple hover:text-white focus:outline-none disabled:opacity-50"
                              aria-label="Refresh FPL data"
                            >
                                <span className="sr-only">Refresh FPL Data</span>
                                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                         <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-pl-purple-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
             {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         <NavLink to="/" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Leaderboard</NavLink>
                         <NavLink to="/rosters" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Rosters</NavLink>
                         <NavLink to="/trades" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Trades</NavLink>
                         <NavLink to="/history" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>History</NavLink>
                         <NavLink to="/setup" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Setup</NavLink>
                    </div>
                </div>
            )}
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="text-center text-xs text-gray-500 py-4 mt-8">
        <p>Data from the official Fantasy Premier League API. This is an unofficial tool.</p>
    </footer>
);

const Bars3Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);

const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0011.664 0M2.985 19.644A8.25 8.25 0 0116.023 9.348" /></svg>
);


export default App;