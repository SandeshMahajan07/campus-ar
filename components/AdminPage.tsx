import React, { useEffect, useRef, useState } from 'react';
import { CAMPUS_DATA } from '../constants';
import { CampusNode } from '../types';

// ── QR Code generation using qrcode library loaded from CDN ──
declare global {
  var QRCode: any;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  entrance: { bg: '#0f4c2a', text: '#4ade80', label: 'ENTRANCE' },
  room:     { bg: '#0c2340', text: '#60a5fa', label: 'ROOM' },
  junction: { bg: '#2d1b00', text: '#fbbf24', label: 'JUNCTION' },
  parking:  { bg: '#1a0a2e', text: '#c084fc', label: 'PARKING' },
  stairs:   { bg: '#1f1506', text: '#fb923c', label: 'STAIRS' },
  elevator: { bg: '#0a1f2e', text: '#38bdf8', label: 'ELEVATOR' },
};

// Single QR Card component
const QRCard: React.FC<{ node: CampusNode; size: number }> = ({ node, size }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const generate = () => {
      if (!canvasRef.current || !window.QRCode) return;
      try {
        QRCode.toCanvas(canvasRef.current, node.id, {
          width: size,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        }, (err: any) => {
          if (!err) setReady(true);
        });
      } catch (e) {
        console.error('QR gen error:', e);
      }
    };

    // Wait for QRCode library to load
    if (window.QRCode) {
      generate();
    } else {
      const interval = setInterval(() => {
        if (window.QRCode) { clearInterval(interval); generate(); }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [node.id, size]);

  const colors = TYPE_COLORS[node.type] ?? TYPE_COLORS.room;

  return (
    <div
      className="qr-card"
      style={{
        background: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
      }}
    >
      {/* Type badge header */}
      <div style={{
        background: colors.bg,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          color: colors.text,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontFamily: 'monospace',
        }}>
          {colors.label}
        </span>
        {node.floor > 0 && (
          <span style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 20,
            letterSpacing: 1,
          }}>
            FLOOR {node.floor}
          </span>
        )}
      </div>

      {/* QR Code */}
      <div style={{
        padding: 16,
        display: 'flex',
        justifyContent: 'center',
        background: '#fff',
        position: 'relative',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            display: ready ? 'block' : 'none',
            borderRadius: 4,
          }}
        />
        {!ready && (
          <div style={{
            width: size,
            height: size,
            background: '#f1f5f9',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>Generating...</span>
          </div>
        )}
      </div>

      {/* Node info */}
      <div style={{
        padding: '0 16px 14px',
        borderTop: '1px solid #f1f5f9',
      }}>
        <p style={{
          fontSize: 14,
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: 2,
          lineHeight: 1.3,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {node.name}
        </p>
        <p style={{
          fontSize: 11,
          color: '#64748b',
          marginBottom: 6,
          lineHeight: 1.4,
        }}>
          {node.description}
        </p>
        {/* Node ID — what's encoded in the QR */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '4px 8px',
          display: 'inline-block',
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#475569',
            letterSpacing: 0.5,
          }}>
            {node.id}
          </span>
        </div>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const [qrSize, setQrSize] = useState(160);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [qrLibLoaded, setQrLibLoaded] = useState(false);

  // Load qrcode.js from CDN dynamically
  useEffect(() => {
    if (window.QRCode) { setQrLibLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => setQrLibLoaded(true);
    script.onerror = () => {
      // Fallback to alternative CDN
      const s2 = document.createElement('script');
      s2.src = 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js';
      s2.onload = () => setQrLibLoaded(true);
      document.head.appendChild(s2);
    };
    document.head.appendChild(script);
  }, []);

  const filteredNodes = CAMPUS_DATA.nodes.filter(n => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
                          n.id.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const uniqueTypes = [...new Set(CAMPUS_DATA.nodes.map(n => n.type))];

  const handlePrint = () => window.print();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>

      {/* ── PRINT STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;800&family=DM+Mono:wght@400;500&display=swap');
        @media print {
          .no-print { display: none !important; }
          .qr-grid { grid-template-columns: repeat(3, 1fr) !important; }
          body { background: white !important; }
          .admin-header { display: none !important; }
          .print-title { display: block !important; }
        }
        .print-title { display: none; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="no-print admin-header" style={{
        background: '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h3v3m4 0v-3h-3m0 7h3v-4"/>
              </svg>
            </div>
            <div>
              <h1 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 800, margin: 0 }}>
                CampusPath AR — Admin
              </h1>
              <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>QR Code Generator</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* QR size slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#64748b', fontSize: 11 }}>Size</span>
            <input
              type="range"
              min={100}
              max={240}
              step={20}
              value={qrSize}
              onChange={e => setQrSize(Number(e.target.value))}
              style={{ width: 80, accentColor: '#3b82f6' }}
            />
            <span style={{ color: '#94a3b8', fontSize: 11, minWidth: 32 }}>{qrSize}px</span>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 12px rgba(59,130,246,0.4)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
            </svg>
            Print All QR Codes
          </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="no-print" style={{
        padding: '16px 24px',
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              outline: 'none',
              color: '#0f172a',
              background: '#f8fafc',
            }}
          />
        </div>

        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', ...uniqueTypes].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                background: filterType === type ? '#0f172a' : '#f1f5f9',
                color: filterType === type ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Count */}
        <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 'auto' }}>
          {filteredNodes.length} of {CAMPUS_DATA.nodes.length} nodes
        </span>
      </div>

      {/* ── QR GRID ── */}
      <div style={{ padding: 24 }}>

        {/* Print header — only visible when printing */}
        <div className="print-title" style={{ marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            CampusPath AR — QR Location Codes
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Print and place these at their respective campus locations
          </p>
        </div>

        {!qrLibLoaded ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p>Loading QR generator...</p>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p>No nodes match your search</p>
          </div>
        ) : (
          <div
            className="qr-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {filteredNodes.map(node => (
              <QRCard key={node.id} node={node} size={qrSize} />
            ))}
          </div>
        )}
      </div>

      {/* ── INSTRUCTIONS FOOTER ── */}
      <div className="no-print" style={{
        margin: '0 24px 24px',
        background: '#0f172a',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        {[
          { icon: '🖨️', title: 'Print', desc: 'Click "Print All QR Codes" or use Ctrl+P. Set layout to portrait, 3 per row.' },
          { icon: '✂️', title: 'Cut & Laminate', desc: 'Laminate each card for weather resistance before placing outdoors.' },
          { icon: '📍', title: 'Place', desc: 'Fix each QR at eye level at its exact campus location. The ID must match the node.' },
          { icon: '🧪', title: 'Test', desc: 'Open the app, select a destination, then scan the QR. It should show directions immediately.' },
        ].map(step => (
          <div key={step.title} style={{ flex: '1 1 180px' }}>
            <p style={{ fontSize: 20, marginBottom: 4 }}>{step.icon}</p>
            <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{step.title}</p>
            <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;