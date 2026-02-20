import React, { useEffect, useRef } from 'react';

interface DirectionArrowProps {
  bearingToTarget: number;  // absolute bearing to target in degrees (0 = North)
  deviceHeading: number;    // compass heading of phone (0 = North)
  targetName: string;
  distance: number | null;  // meters
  accuracy: 'exact' | 'estimated';
}

const DirectionArrow: React.FC<DirectionArrowProps> = ({
  bearingToTarget,
  deviceHeading,
  targetName,
  distance,
  accuracy,
}) => {
  const arrowRef = useRef<HTMLDivElement>(null);
  const prevRotation = useRef(0);

  // Relative angle = where target is relative to where phone is pointing
  // 0 = straight ahead, 90 = right, -90 = left, 180 = behind
  useEffect(() => {
    if (!arrowRef.current) return;

    let relative = (bearingToTarget - deviceHeading + 360) % 360;
    // Normalize to -180 to +180 so rotation takes shortest path
    if (relative > 180) relative -= 360;

    // Smooth: interpolate toward target to avoid sudden jumps
    const diff = relative - prevRotation.current;
    const smoothed = prevRotation.current + diff * 0.3;
    prevRotation.current = smoothed;

    arrowRef.current.style.transform = `rotate(${smoothed}deg)`;
  }, [bearingToTarget, deviceHeading]);

  const formatDistance = (m: number | null) => {
    if (m === null) return '...';
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${m}m`;
  };

  const getDirectionLabel = () => {
    let rel = (bearingToTarget - deviceHeading + 360) % 360;
    if (rel > 180) rel -= 360;
    if (rel > -22.5 && rel <= 22.5) return 'STRAIGHT AHEAD';
    if (rel > 22.5 && rel <= 67.5) return 'AHEAD RIGHT';
    if (rel > 67.5 && rel <= 112.5) return 'TURN RIGHT';
    if (rel > 112.5 && rel <= 157.5) return 'SHARP RIGHT';
    if (rel > 157.5 || rel <= -157.5) return 'TURN AROUND';
    if (rel > -157.5 && rel <= -112.5) return 'SHARP LEFT';
    if (rel > -112.5 && rel <= -67.5) return 'TURN LEFT';
    return 'AHEAD LEFT';
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 100,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      pointerEvents: 'none',
    }}>

      {/* Destination + distance pill */}
      <div style={{
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(59,130,246,0.5)',
        borderRadius: 24,
        padding: '6px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 2px 20px rgba(59,130,246,0.25)',
      }}>
        <span style={{ color: '#60a5fa', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
          {targetName}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>·</span>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
          {formatDistance(distance)}
        </span>
        {accuracy === 'estimated' && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>·</span>
            <span style={{ color: '#f59e0b', fontSize: 10, fontWeight: 600 }}>~est.</span>
          </>
        )}
      </div>

      {/* 3D Arrow — CSS perspective trick for depth */}
      <div style={{
        width: 110,
        height: 110,
        perspective: '400px',
        position: 'relative',
      }}>
        {/* Outer glow ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />

        {/* Main circle */}
        <div style={{
          position: 'absolute',
          inset: 8,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,58,138,0.9))',
          border: '1.5px solid rgba(59,130,246,0.6)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
        }}>

          {/* Rotating arrow SVG */}
          <div
            ref={arrowRef}
            style={{
              width: 70,
              height: 70,
              transition: 'transform 0.15s ease-out',
              filter: 'drop-shadow(0 3px 8px rgba(59,130,246,0.8))',
            }}
          >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Arrow shadow layer for 3D depth */}
              <g transform="translate(3, 5)" opacity="0.3">
                <polygon points="50,5 75,45 62,45 62,90 38,90 38,45 25,45" fill="#1e3a8a" />
              </g>
              {/* Main arrow body */}
              <defs>
                <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="shaftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              {/* Shaft */}
              <rect x="38" y="45" width="24" height="48" rx="4" fill="url(#shaftGrad)" />
              {/* Arrowhead */}
              <polygon points="50,4 78,48 62,48 62,48 38,48 22,48" fill="url(#arrowGrad)" />
              {/* Highlight shine on arrowhead */}
              <polygon points="50,4 62,28 50,32" fill="rgba(255,255,255,0.25)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Direction label */}
      <div style={{
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '4px 14px',
      }}>
        <span style={{
          color: '#e2e8f0',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          {getDirectionLabel()}
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default DirectionArrow;