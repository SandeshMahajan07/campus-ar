import React, { useState } from 'react';
import { CampusNode } from '../types';
import { CAMPUS_DATA } from '../constants';

interface NavigationUIProps {
  onStartNavigation: (start: string | null, end: string) => void;
  currentInstruction: string | null;
  activePath: CampusNode[] | null;
  onReset: () => void;
  isWaitingForScan: boolean; // 1. WE ADDED THIS TO FIX YOUR ERROR
}

const NavigationUI: React.FC<NavigationUIProps> = ({ 
  onStartNavigation, 
  currentInstruction, 
  activePath,
  onReset,
  isWaitingForScan // 2. WE RECEIVE IT HERE
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
            <p className="text-sm text-gray-400 tracking-widest uppercase">Geospatial Navigation</p>
          </div>
          {/* Show reset button if navigating OR waiting to scan */}
          {(activePath || isWaitingForScan) && (
             <button onClick={onReset} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          )}
        </div>
      </div>

      <div className="space-y-4 pointer-events-auto">
        {/* 3. WE UPDATE THIS LOGIC TO HANDLE ALL 3 STATES */}
        {!activePath && !isWaitingForScan ? (
          /* STATE 1: Choose destination */
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
            </div>
          </div>
        ) : isWaitingForScan ? (
          /* STATE 2: Waiting for the user to scan a QR code */
          <div className="bg-yellow-500/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom border border-yellow-400/30">
            <div className="flex items-center space-x-4">
               <div className="bg-white/20 p-3 rounded-2xl animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
               </div>
               <div>
                  <p className="text-lg font-bold leading-tight text-white">
                    Point camera at a location QR code...
                  </p>
               </div>
            </div>
          </div>
        ) : (
          /* STATE 3: Active Navigation */
          <div className="bg-blue-600/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom border border-blue-400/30">
            <div className="flex items-center space-x-4">
               <div className="bg-white/20 p-3 rounded-2xl">
                  <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
               </div>
               <div>
                  <p className="text-xs text-blue-100 font-medium uppercase tracking-tighter mb-1">Instruction</p>
                  <p className="text-lg font-bold leading-tight text-white">
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