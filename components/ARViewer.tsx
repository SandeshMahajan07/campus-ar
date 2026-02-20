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
        'a-cylinder': any;
        'a-sphere': any;
        'a-ring': any;
        'a-text': any;
        'a-camera': any;
        'a-light': any;
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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        });

        if (destroyed) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;

        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;

        await video.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const scan = () => {
          if (destroyed) return;

          if (video.readyState === video.HAVE_ENOUGH_DATA && window.jsQR && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth',
              });

              if (code?.data) {
                const now = Date.now();
                if (code.data !== lastScannedRef.current || now - lastScannedTimeRef.current > 3000) {
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

      } catch (err: any) {
        console.error('QR Scanner error:', err.message);
      }
    };

    startScanner();

    return () => {
      destroyed = true;
      if (scannerRef.current) cancelAnimationFrame(scannerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (videoRef.current) { videoRef.current.remove(); videoRef.current = null; }
    };
  }, [onQRScanned]);

  return (
    <a-scene
      vr-mode-ui="enabled: false"
      arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false;"
      renderer="antialias: true; alpha: true"
    >
      {/* Ambient + directional light for better 3D shading */}
      <a-light type="ambient" color="#ffffff" intensity="0.6"></a-light>
      <a-light type="directional" position="1 3 -1" color="#ffffff" intensity="0.8"></a-light>

      <a-camera gps-camera rotation-reader></a-camera>

      {isActive && targetNode && (
        <a-entity
          gps-entity-place={`latitude: ${targetNode.lat}; longitude: ${targetNode.lng};`}
        >
          {/* 
            ── GROUND PULSE RING ──
            A flat ring on the ground that pulses outward to draw attention
          */}
          <a-ring
            position="0 0.05 0"
            radius-inner="0.8"
            radius-outer="1.2"
            color="#3b82f6"
            opacity="0.6"
            rotation="-90 0 0"
            animation__scale="property: scale; from: 1 1 1; to: 2.5 2.5 2.5; dur: 1500; loop: true; easing: easeOutQuad"
            animation__opacity="property: opacity; from: 0.6; to: 0; dur: 1500; loop: true; easing: easeOutQuad"
          ></a-ring>

          {/* Static base ring */}
          <a-ring
            position="0 0.05 0"
            radius-inner="0.5"
            radius-outer="0.8"
            color="#60a5fa"
            opacity="0.9"
            rotation="-90 0 0"
          ></a-ring>

          {/* 
            ── BOBBING WRAPPER ──
            Everything above ground bobs up and down
          */}
          <a-entity animation="property: position; from: 0 0 0; to: 0 0.6 0; dur: 1200; dir: alternate; loop: true; easing: easeInOutSine">

            {/* Vertical shaft (cylinder) */}
            <a-cylinder
              position="0 2 0"
              radius="0.18"
              height="3.5"
              color="#2563eb"
              shadow
            ></a-cylinder>

            {/* Arrow head (cone pointing down toward ground) */}
            <a-cone
              position="0 0.4 0"
              radius-bottom="0.9"
              radius-top="0"
              height="1.8"
              color="#3b82f6"
              rotation="180 0 0"
              shadow
            ></a-cone>

            {/* Top sphere cap (makes the pin look like a classic map pin) */}
            <a-sphere
              position="0 3.8 0"
              radius="0.55"
              color="#60a5fa"
              shadow
            ></a-sphere>

            {/* 
              ── NAME LABEL ──
              Always faces the camera, floats above the pin
            */}
            <a-entity position="0 5.2 0" look-at="[gps-camera]">
              {/* Label background pill */}
              <a-entity
                geometry="primitive: plane; width: 4.5; height: 0.9"
                material="color: #1e3a8a; opacity: 0.85; transparent: true; side: double"
                position="0 0 -0.01"
              ></a-entity>

              {/* Destination name */}
              <a-text
                value={targetNode.name}
                align="center"
                color="#ffffff"
                width="4"
                position="0 0.05 0"
                font="exo2bold"
              ></a-text>

              {/* "HEAD TO" sub-label */}
              <a-text
                value="HEAD TO"
                align="center"
                color="#93c5fd"
                width="3"
                position="0 -0.35 0"
                font="exo2bold"
              ></a-text>
            </a-entity>

          </a-entity>
        </a-entity>
      )}
    </a-scene>
  );
};

export default ARViewer;