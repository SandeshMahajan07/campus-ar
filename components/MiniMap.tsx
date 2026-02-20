import React, { useMemo, useState } from 'react';
import { CampusNode } from '../types';
import { CAMPUS_DATA } from '../constants';

interface MiniMapProps {
  currentLocationId: string | null;
  activePath: CampusNode[] | null;
  targetNode: CampusNode | null;
  userGPS: { lat: number; lng: number } | null;
}

const MAP_SIZE = 180; // px, the square size of the mini map
const PADDING = 14;   // px, inner padding so nodes don't touch edges

const MiniMap: React.FC<MiniMapProps> = ({ currentLocationId, activePath, targetNode, userGPS }) => {
  const [expanded, setExpanded] = useState(false);
  const size = expanded ? 300 : MAP_SIZE;

  // Compute min/max lat/lng from ALL nodes to build a scale
  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    const lats = (activePath ?? CAMPUS_DATA.nodes).map(n => n.lat);
    const lngs = (activePath ?? CAMPUS_DATA.nodes).map(n => n.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, []);

  // Convert real GPS lat/lng to SVG x/y coordinates
  const toXY = (lat: number, lng: number, mapSize: number) => {
    const usable = mapSize - PADDING * 2;
    // Longitude → X (left to right)
    const x = PADDING + ((lng - minLng) / (maxLng - minLng)) * usable;
    // Latitude → Y (top = high lat, bottom = low lat, so we invert)
    const y = PADDING + ((maxLat - lat) / (maxLat - minLat)) * usable;
    return { x, y };
  };

  // Deduplicate nodes that share the same lat/lng (EEE/ECE, ISE/AIML)
  const uniqueNodes = useMemo(() => {
    const seen = new Set<string>();
    return CAMPUS_DATA.nodes.filter(n => {
      const key = `${n.lat.toFixed(6)},${n.lng.toFixed(6)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  // Which node IDs are on the active path
  const pathIds = useMemo(() => new Set(activePath?.map(n => n.id) ?? []), [activePath]);

  // Active path as ordered coordinate pairs for the path line
  const pathPoints = useMemo(() => {
    if (!activePath || activePath.length < 2) return [];
    return activePath.map(n => toXY(n.lat, n.lng, size));
  }, [activePath, size]);

  // User's live GPS dot position (if available)
  const userDot = useMemo(() => {
    if (!userGPS) return null;
    return toXY(userGPS.lat, userGPS.lng, size);
  }, [userGPS, size]);

  const currentNode = CAMPUS_DATA.nodes.find(n => n.id === currentLocationId);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 70,
        right: 12,
        zIndex: 55,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(10, 15, 30, 0.92)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(59,130,246,0.35)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={() => setExpanded(e => !e)}
      title="Tap to expand/collapse map"
    >
      {/* Header */}
      <div style={{
        padding: '5px 10px',
        background: 'rgba(30,58,138,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <span style={{ color: '#93c5fd', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
          📍 Campus Map
        </span>
        <span style={{ color: '#60a5fa', fontSize: 10 }}>{expanded ? '▼' : '▲'}</span>
      </div>

      {/* SVG Map */}
      <svg width={size} height={size} style={{ display: 'block' }}>

        {/* ── ALL EDGES (grey, faint) ── */}
        {CAMPUS_DATA.edges.map((edge, i) => {
          const fromNode = CAMPUS_DATA.nodes.find(n => n.id === edge.from);
          const toNode = CAMPUS_DATA.nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          const from = toXY(fromNode.lat, fromNode.lng, size);
          const to = toXY(toNode.lat, toNode.lng, size);
          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="rgba(100,116,139,0.4)"
              strokeWidth={expanded ? 1.5 : 1}
            />
          );
        })}

        {/* ── ACTIVE PATH (blue, glowing) ── */}
        {pathPoints.length >= 2 && (
          <>
            {/* Glow layer */}
            <polyline
              points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="rgba(96,165,250,0.3)"
              strokeWidth={expanded ? 8 : 5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main path line */}
            <polyline
              points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={expanded ? 3 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={expanded ? "6 3" : "4 2"}
            />
          </>
        )}

        {/* ── ALL NODES (small dots) ── */}
        {uniqueNodes.map(node => {
          const { x, y } = toXY(node.lat, node.lng, size);
          const isOnPath = pathIds.has(node.id);
          const isCurrent = node.id === currentLocationId;
          const isTarget = node.id === targetNode?.id;

          let color = 'rgba(100,116,139,0.6)';
          if (isOnPath) color = '#60a5fa';
          if (isTarget) color = '#f59e0b';
          if (isCurrent) color = '#22c55e';

          const r = isCurrent || isTarget ? (expanded ? 6 : 4) : (expanded ? 3.5 : 2.5);

          return (
            <g key={node.id}>
              {/* Pulse ring for current and target */}
              {(isCurrent || isTarget) && (
                <circle cx={x} cy={y} r={r + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />
              )}
              <circle cx={x} cy={y} r={r} fill={color} />

              {/* Node label — only show on expanded map for path nodes */}
              {expanded && isOnPath && (
                <text
                  x={x + 7}
                  y={y + 4}
                  fontSize={7}
                  fill={isCurrent ? '#22c55e' : isTarget ? '#f59e0b' : '#93c5fd'}
                  fontWeight={isCurrent || isTarget ? 'bold' : 'normal'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.name.length > 12 ? node.name.slice(0, 11) + '…' : node.name}
                </text>
              )}
            </g>
          );
        })}

        {/* ── LIVE USER GPS DOT ── */}
        {userDot && (
          <g>
            <circle cx={userDot.x} cy={userDot.y} r={expanded ? 7 : 5} fill="rgba(34,197,94,0.2)" />
            <circle cx={userDot.x} cy={userDot.y} r={expanded ? 4 : 3} fill="#22c55e" />
            <circle cx={userDot.x} cy={userDot.y} r={expanded ? 2 : 1.5} fill="#fff" />
          </g>
        )}
      </svg>

      {/* Legend — only when expanded */}
      {expanded && (
        <div style={{
          padding: '6px 10px',
          borderTop: '1px solid rgba(59,130,246,0.2)',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}>
          {[
            { color: '#22c55e', label: 'You are here' },
            { color: '#f59e0b', label: 'Next stop' },
            { color: '#3b82f6', label: 'Your route' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
              <span style={{ color: '#94a3b8', fontSize: 9 }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MiniMap;