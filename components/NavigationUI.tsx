import React, { useState } from 'react';
import { CampusNode } from '../types';
import { CAMPUS_DATA } from '../constants';

interface NavigationUIProps {
  onStartNavigation: (start: string | null, end: string) => void;
  currentInstruction: string | null;
  activePath: CampusNode[] | null;
  onReset: () => void;
  isWaitingForScan: boolean;
  currentLocationId: string | null;
  stepsSinceLastScan: number; // for drift warning
}

const DRIFT_WARNING_STEPS = 50; // warn after 50 steps without a QR scan

const NavigationUI: React.FC<NavigationUIProps> = ({
  onStartNavigation,
  currentInstruction,
  activePath,
  onReset,
  isWaitingForScan,
  currentLocationId,
  stepsSinceLastScan,
}) => {
  const [dest, setDest] = useState<string>('');

  const destinations = CAMPUS_DATA.nodes.filter(
    n => n.type === 'room' || n.type === 'entrance' || n.type === 'parking'
  );

  // Step progress: which index in the path is current
  const currentStepIndex = activePath && currentLocationId
    ? activePath.findIndex(n => n.id === currentLocationId)
    : -1;
  const totalSteps = activePath?.length ?? 0;

  const showDriftWarning = stepsSinceLastScan >= DRIFT_WARNING_STEPS;

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 z-50">

      {/* ── HEADER ── */}
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CampusPath AR
            </h1>
            <p className="text-sm text-gray-400 tracking-widest uppercase">Geospatial Navigation</p>
          </div>
          {(activePath || isWaitingForScan) && (
            <button onClick={onReset} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── STEP PROGRESS BAR ── only when navigating */}
        {activePath && currentStepIndex >= 0 && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-blue-300 font-semibold uppercase tracking-wide">
                Route Progress
              </span>
              <span className="text-xs text-gray-400">
                Stop {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {activePath.map((node, i) => (
                <div key={node.id} className="flex items-center gap-1.5 flex-1">
                  <div
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === currentStepIndex ? 10 : 7,
                      height: i === currentStepIndex ? 10 : 7,
                      minWidth: i === currentStepIndex ? 10 : 7,
                      background: i < currentStepIndex
                        ? '#22c55e'                         // passed — green
                        : i === currentStepIndex
                        ? '#3b82f6'                         // current — blue
                        : 'rgba(255,255,255,0.2)',          // upcoming — grey
                      boxShadow: i === currentStepIndex ? '0 0 6px rgba(59,130,246,0.8)' : 'none',
                    }}
                  />
                  {/* Connector line between dots */}
                  {i < activePath.length - 1 && (
                    <div
                      className="h-0.5 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: i < currentStepIndex
                          ? '#22c55e'
                          : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pointer-events-auto">

        {/* ── DRIFT WARNING ── */}
        {showDriftWarning && activePath && currentLocationId && (
          <div className="bg-orange-500/90 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-orange-400/30 flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Look for a QR code to recalibrate
              </p>
              <p className="text-orange-100 text-xs mt-0.5">
                {stepsSinceLastScan} steps since last scan — position may have drifted
              </p>
            </div>
          </div>
        )}

        {/* ── MAIN STATE PANEL ── */}
        {!activePath && !isWaitingForScan ? (

          /* STATE 1: Choose destination */
          <div className="bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-300 uppercase mb-2">
                  Select Your Destination
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 text-white p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                >
                  <option value="">-- Choose a Building --</option>
                  {destinations.sort((a, b) => a.name.localeCompare(b.name)).map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name}{n.floor > 0 ? ` (Floor ${n.floor})` : ''}
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>

        ) : isWaitingForScan ? (

          /* STATE 2: Waiting for QR scan */
          <div className="bg-yellow-500/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-yellow-400/30">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl animate-pulse shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-lg font-bold leading-tight text-white">
                Point camera at a location QR code...
              </p>
            </div>
          </div>

        ) : (

          /* STATE 3: Active Navigation */
          <div className="bg-blue-600/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-blue-400/30">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl shrink-0">
                <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-blue-100 font-medium uppercase tracking-tighter mb-1">
                  Next Step
                </p>
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