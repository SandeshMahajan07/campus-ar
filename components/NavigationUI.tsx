
import React, { useState } from 'react';
import { CampusNode } from '../types';
import { CAMPUS_DATA } from '../constants';

interface NavigationUIProps {
  onStartNavigation: (start: string, end: string) => void;
  currentInstruction: string | null;
  activePath: CampusNode[] | null;
  onReset: () => void;
}

const NavigationUI: React.FC<NavigationUIProps> = ({ 
  onStartNavigation, 
  currentInstruction, 
  activePath,
  onReset 
}) => {
  const [start, setStart] = useState<string>('ENT');
  const [dest, setDest] = useState<string>('');

  const rooms = CAMPUS_DATA.nodes.filter(n => n.type === 'room' || n.type === 'entrance');

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 z-50">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          CampusPath AR
        </h1>
        <p className="text-xs text-gray-300">Welcome home, Alumni.</p>
      </div>

      {/* Main Controls */}
      <div className="space-y-4 pointer-events-auto">
        {!activePath ? (
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-3xl border border-white/20 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-300 uppercase mb-1">Your Current Checkpoint</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                >
                  {CAMPUS_DATA.nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-blue-300 uppercase mb-1">Where to next?</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                >
                  <option value="">Select Destination</option>
                  {rooms.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => dest && onStartNavigation(start, dest)}
                disabled={!dest}
                className={`w-full py-4 rounded-xl font-bold transition-all transform active:scale-95 ${
                  dest 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start AR Navigation
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-600/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom border border-blue-400/30">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Navigating</span>
              <button onClick={onReset} className="text-white/60 hover:text-white">✕</button>
            </div>
            <p className="text-2xl font-bold leading-tight mb-1">
              {currentInstruction || "Scan the marker to proceed..."}
            </p>
            <p className="text-sm text-blue-100 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Destination: {CAMPUS_DATA.nodes.find(n => n.id === activePath[activePath.length - 1].id)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationUI;
