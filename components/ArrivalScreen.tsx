import React, { useEffect, useRef } from 'react';
import { CampusNode } from '../types';

interface ArrivalScreenProps {
  destination: CampusNode;
  totalSteps: number;
  onDismiss: () => void;
}

const ArrivalScreen: React.FC<ArrivalScreenProps> = ({ destination, totalSteps, onDismiss }) => {
  const hasVibrated = useRef(false);

  useEffect(() => {
    // Haptic — triple buzz for arrival
    if (!hasVibrated.current && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
      hasVibrated.current = true;
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'linear-gradient(135deg, rgba(5,10,25,0.97) 0%, rgba(10,30,80,0.97) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      textAlign: 'center',
      backdropFilter: 'blur(20px)',
    }}>

      {/* Animated checkmark ring */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 28 }}>
        {/* Pulsing outer ring */}
        <div style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          border: '2px solid rgba(34,197,94,0.4)',
          animation: 'arrivalPulse 1.5s ease-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          inset: -20,
          borderRadius: '50%',
          border: '2px solid rgba(34,197,94,0.2)',
          animation: 'arrivalPulse 1.5s ease-out 0.3s infinite',
        }} />
        {/* Main circle */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          boxShadow: '0 0 40px rgba(34,197,94,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path
              d="M12 28 L24 40 L44 16"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'drawCheck 0.4s ease-out forwards' }}
            />
          </svg>
        </div>
      </div>

      {/* You have arrived text */}
      <p style={{
        color: '#22c55e',
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        You have arrived
      </p>

      {/* Destination name */}
      <h1 style={{
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 800,
        lineHeight: 1.2,
        marginBottom: 8,
      }}>
        {destination.name}
      </h1>

      {/* Description */}
      {destination.description && (
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>
          {destination.description}
        </p>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 36,
      }}>
        {totalSteps > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '12px 20px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#60a5fa', fontSize: 22, fontWeight: 800 }}>{totalSteps}</p>
            <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Steps walked</p>
          </div>
        )}
        {destination.floor > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '12px 20px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#a78bfa', fontSize: 22, fontWeight: 800 }}>F{destination.floor}</p>
            <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Floor</p>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '18px 0',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          color: '#fff',
          fontSize: 16,
          fontWeight: 800,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(34,197,94,0.4)',
          letterSpacing: 0.5,
        }}
      >
        Navigate Somewhere Else
      </button>

      <style>{`
        @keyframes arrivalPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes drawCheck {
          from { stroke-dasharray: 0 80; }
          to { stroke-dasharray: 80 0; }
        }
      `}</style>
    </div>
  );
};

export default ArrivalScreen;