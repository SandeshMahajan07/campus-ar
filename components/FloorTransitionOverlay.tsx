import React, { useEffect, useRef } from 'react';

interface FloorTransitionOverlayProps {
  currentFloor: number;
  nextFloor: number;
  nextNodeName: string;
  onDismiss: () => void;
}

const FloorTransitionOverlay: React.FC<FloorTransitionOverlayProps> = ({
  currentFloor,
  nextFloor,
  nextNodeName,
  onDismiss,
}) => {
  const hasVibrated = useRef(false);

  useEffect(() => {
    if (!hasVibrated.current && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
      hasVibrated.current = true;
    }
  }, []);

  const goingUp = nextFloor > currentFloor;
  const floorDiff = Math.abs(nextFloor - currentFloor);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 150,
      background: 'linear-gradient(160deg, rgba(5,10,30,0.97) 0%, rgba(20,10,50,0.97) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      textAlign: 'center',
      backdropFilter: 'blur(20px)',
    }}>

      {/* Animated floor icon */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {/* Building outline */}
        <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
          {/* Building body */}
          <rect x="20" y="20" width="80" height="110" rx="4"
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>

          {/* Floor lines */}
          {[0,1,2,3].map(i => (
            <line key={i} x1="20" y1={20 + (i+1)*22} x2="100" y2={20 + (i+1)*22}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          ))}

          {/* Current floor highlight */}
          <rect x="20" y={20 + (3 - currentFloor) * 22} width="80" height="22"
            fill="rgba(100,116,139,0.3)" rx="0"/>

          {/* Target floor highlight */}
          <rect x="20" y={20 + (3 - nextFloor) * 22} width="80" height="22"
            fill="rgba(139,92,246,0.4)" rx="0"/>

          {/* Floor labels */}
          {[0,1,2,3].map(i => (
            <text key={i} x="60" y={20 + (3-i)*22 + 15}
              textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)"
              fontFamily="monospace">
              F{i}
            </text>
          ))}

          {/* Animated arrow */}
          <g style={{ animation: 'floorBounce 1s ease-in-out infinite' }}>
            <text x="60" y={goingUp ? 45 : 100}
              textAnchor="middle" fontSize="20"
              style={{ animation: 'floorBounce 1s ease-in-out infinite' }}>
              {goingUp ? '⬆' : '⬇'}
            </text>
          </g>
        </svg>
      </div>

      {/* Floor change badge */}
      <div style={{
        background: 'rgba(139,92,246,0.2)',
        border: '1px solid rgba(139,92,246,0.5)',
        borderRadius: 24,
        padding: '6px 20px',
        marginBottom: 12,
      }}>
        <span style={{
          color: '#c4b5fd',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          Floor Change
        </span>
      </div>

      {/* Main instruction */}
      <h2 style={{
        color: '#ffffff',
        fontSize: 26,
        fontWeight: 800,
        lineHeight: 1.2,
        marginBottom: 8,
      }}>
        {goingUp ? '🪜 Go Up' : '🪜 Go Down'} {floorDiff} Floor{floorDiff > 1 ? 's' : ''}
      </h2>

      <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 6 }}>
        {goingUp ? 'Take the stairs or elevator up to' : 'Take the stairs or elevator down to'}
      </p>

      <p style={{
        color: '#e2e8f0',
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 6,
      }}>
        Floor {nextFloor}
      </p>

      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 40 }}>
        Heading to <span style={{ color: '#a78bfa' }}>{nextNodeName}</span>
      </p>

      {/* Floor indicators */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 40,
      }}>
        <div style={{
          background: 'rgba(100,116,139,0.2)',
          border: '1px solid rgba(100,116,139,0.4)',
          borderRadius: 12,
          padding: '10px 20px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>You are on</p>
          <p style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 800 }}>Floor {currentFloor}</p>
        </div>

        <div style={{ color: '#6366f1', fontSize: 24 }}>
          {goingUp ? '→' : '→'}
        </div>

        <div style={{
          background: 'rgba(139,92,246,0.2)',
          border: '1px solid rgba(139,92,246,0.5)',
          borderRadius: 12,
          padding: '10px 20px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#c4b5fd', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Go to</p>
          <p style={{ color: '#ffffff', fontSize: 22, fontWeight: 800 }}>Floor {nextFloor}</p>
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '18px 0',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
          color: '#fff',
          fontSize: 16,
          fontWeight: 800,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
        }}
      >
        Got it — I'm heading up
      </button>

      <style>{`
        @keyframes floorBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(${goingUp ? '-6px' : '6px'}); }
        }
      `}</style>
    </div>
  );
};

export default FloorTransitionOverlay;