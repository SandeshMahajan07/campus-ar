import React, { useEffect, useRef, useState } from 'react';
import { CampusNode } from '../types';

declare global {
  var jsQR: any;
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'a-scene': any;
        'a-entity': any;
        'a-cone': any;
        'a-text': any;
        'a-camera': any;
      }
    }
  }
}

interface ARViewerProps {
  isActive: boolean;
  targetNode: CampusNode | null;
  onQRScanned: (data: string) => void;
}

const ARViewer: React.FC<ARViewerProps> = ({ isActive, targetNode, onQRScanned }) => {
  const scannerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  // Debug state — visible on screen
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log('[QR]', msg);
    setDebugLog(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 6)]);
  };

  useEffect(() => {
    let destroyed = false;

    const startScanner = async () => {
      log('Starting camera...');

      // Check if jsQR is loaded
      if (!window.jsQR) {
        log('ERROR: jsQR not loaded!');
      } else {
        log('jsQR is ready ✓');
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        });

        if (destroyed) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        log('Camera stream acquired ✓');
        streamRef.current = stream;

        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;

        await video.play();
        log(`Video playing ✓ (${video.videoWidth}x${video.videoHeight})`);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        let frameCount = 0;

        const scan = () => {
          if (destroyed) return;

          frameCount++;

          // Log video state every 60 frames (~1 sec)
          if (frameCount % 60 === 0) {
            log(`Scanning... readyState=${video.readyState} size=${video.videoWidth}x${video.videoHeight} jsQR=${!!window.jsQR}`);
          }

          if (
            video.readyState === video.HAVE_ENOUGH_DATA &&
            window.jsQR &&
            video.videoWidth > 0
          ) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

              const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth',
              });

              if (code && code.data) {
                log(`QR DETECTED: "${code.data}" ✓`);
                const now = Date.now();
                if (
                  code.data !== lastScannedRef.current ||
                  now - lastScannedTimeRef.current > 3000
                ) {
                  lastScannedRef.current = code.data;
                  lastScannedTimeRef.current = now;
                  onQRScanned(code.data);
                }
              }
            }
          } else if (frameCount % 60 === 0) {
            if (!window.jsQR) log('WAITING: jsQR not ready');
            else if (video.readyState !== video.HAVE_ENOUGH_DATA) log(`WAITING: video readyState=${video.readyState}`);
            else if (video.videoWidth === 0) log('WAITING: video dimensions 0');
          }

          scannerRef.current = requestAnimationFrame(scan);
        };

        scannerRef.current = requestAnimationFrame(scan);

      } catch (err: any) {
        log(`CAMERA ERROR: ${err.message}`);
      }
    };

    startScanner();

    return () => {
      destroyed = true;
      if (scannerRef.current) cancelAnimationFrame(scannerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (videoRef.current) {
        videoRef.current.remove();
        videoRef.current = null;
      }
    };
  }, [onQRScanned]);

  return (
    <>
      <a-scene
        vr-mode-ui="enabled: false"
        arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false;"
        renderer="antialias: true; alpha: true"
      >
        <a-camera gps-camera rotation-reader></a-camera>

        {isActive && targetNode && (
          <a-entity
            gps-entity-place={`latitude: ${targetNode.lat}; longitude: ${targetNode.lng};`}
          >
            <a-entity animation="property: position; to: 0 2 0; dur: 1000; dir: alternate; loop: true">
              <a-cone
                position="0 4 0"
                radius-bottom="1.5"
                height="3"
                color="#3b82f6"
                rotation="180 0 0"
                opacity="0.9"
              ></a-cone>
              <a-text
                value={targetNode.name}
                look-at="[gps-camera]"
                scale="5 5 5"
                position="0 6 0"
                align="center"
                color="#ffffff"
              ></a-text>
            </a-entity>
          </a-entity>
        )}
      </a-scene>

      {/* DEBUG OVERLAY — fixed to top right, always visible */}
      <div style={{
        position: 'fixed',
        top: 80,
        right: 8,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        color: '#00ff88',
        fontFamily: 'monospace',
        fontSize: 11,
        padding: '8px 10px',
        borderRadius: 8,
        maxWidth: 260,
        pointerEvents: 'none',
        border: '1px solid #00ff8844'
      }}>
        <div style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: 4 }}>🔍 QR Debug</div>
        {debugLog.length === 0 ? (
          <div>Initializing...</div>
        ) : (
          debugLog.map((line, i) => (
            <div key={i} style={{ 
              opacity: i === 0 ? 1 : 0.5 - i * 0.05,
              color: line.includes('ERROR') || line.includes('WAITING') ? '#ff6b6b' : line.includes('✓') ? '#00ff88' : '#ffffff'
            }}>
              {line}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ARViewer;