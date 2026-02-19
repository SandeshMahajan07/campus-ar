import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    let destroyed = false;

    const startScanner = async () => {
      try {
        // Request our OWN camera stream, separate from AR.js
        // This gives us full pixel access without AR.js interference
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // rear camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        });

        if (destroyed) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        // Create a hidden video element fed by our own stream
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true'); // Required for iOS
        video.setAttribute('muted', 'true');
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;

        await video.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const scan = () => {
          if (destroyed) return;

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
                inversionAttempts: 'attemptBoth', // Fix: handle both light and dark QR codes
              });

              if (code && code.data) {
                const now = Date.now();
                // Throttle: only fire if it's a new code OR 3 seconds have passed
                // Prevents spamming onQRScanned 60x per second
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
          }

          scannerRef.current = requestAnimationFrame(scan);
        };

        scannerRef.current = requestAnimationFrame(scan);

      } catch (err) {
        console.error('QR Scanner failed to start:', err);
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
  );
};

export default ARViewer;
