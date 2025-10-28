
import React from 'react';
import { Player } from '../types';

interface PlayerDetailModalProps {
    player: Player;
    onClose: () => void;
}

const StatItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className="bg-pl-purple p-3 rounded-lg text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-2xl font-bold ${className}`}>{value}</p>
    </div>
);

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-pl-purple-light border-2 border-pl-green/50 rounded-xl shadow-2xl w-full max-w-md mx-auto text-white transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold">{player.web_name}</h2>
                        <p className="text-md text-gray-300">{player.team_name} - {player.position_short_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-pl-purple transition-colors">
                         <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatItem label="Price" value={`£${(player.now_cost / 10).toFixed(1)}m`} className="text-pl-green" />
                    <StatItem label="Total Points" value={player.total_points} className="text-pl-green" />
                    <StatItem label="GW Points" value={player.event_points} className="text-pl-green" />
                    
                    <StatItem label="Form" value={player.form} />
                    <StatItem label="Bonus" value={player.bonus} />
                    
                    <div className="col-span-2 sm:col-span-3 grid grid-cols-3 gap-3">
                       <StatItem label="Influence" value={player.influence} className="text-sm" />
                       <StatItem label="Creativity" value={player.creativity} className="text-sm" />
                       <StatItem label="Threat" value={player.threat} className="text-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);


export default PlayerDetailModal;
