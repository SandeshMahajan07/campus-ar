
import React, { useState } from 'react';
import { CampusNode } from '../types';
import { CAMPUS_DATA } from '../constants';

interface NavigationUIProps {
  onStartNavigation: (start: string | null, end: string) => void;
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
  const [dest, setDest] = useState<string>('');

  const destinations = CAMPUS_DATA.nodes.filter(n => n.type === 'room' || n.type === 'entrance' || n.type === 'parking');

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 z-50">
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CampusPath AR
            </h1>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase">Geospatial Navigation</p>
          </div>
          {activePath && (
             <button onClick={onReset} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          )}
        </div>
      </div>

      <div className="space-y-4 pointer-events-auto">
        {!activePath ? (
          <div className="bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-300 uppercase mb-2">Select Your Destination</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 text-white p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                >
                  <option value="">-- Choose a Building --</option>
                  {destinations.sort((a,b) => a.name.localeCompare(b.name)).map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} {n.floor > 0 ? `(Floor ${n.floor})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => dest && onStartNavigation(null, dest)}
                disabled={!dest}
                className={`w-full py-5 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${
                  dest 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                <span>Initialize AR Guidance</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
              
              <p className="text-[10px] text-center text-gray-500">
                You will need to scan a nearby QR code to anchor your position after clicking start.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-600/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom border border-blue-400/30">
            <div className="flex items-center space-x-4">
               <div className="bg-white/20 p-3 rounded-2xl">
                  <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
               </div>
               <div>
                  <p className="text-xs text-blue-100 font-medium uppercase tracking-tighter mb-1">Instruction</p>
                  <p className="text-lg font-bold leading-tight">
                    {currentInstruction}
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationUI;
