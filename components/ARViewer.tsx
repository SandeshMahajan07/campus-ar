import React, { useEffect, useRef } from 'react';
import { CampusNode } from '../types'; // Import the type to fix the error

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
  targetNode: CampusNode | null; // Fixed: Now correctly expects the targetNode object
  onQRScanned: (data: string) => void;
}

const ARViewer: React.FC<ARViewerProps> = ({ isActive, targetNode, onQRScanned }) => {
  const scannerRef = useRef<number | null>(null);

  // QR Code Scanning Logic
  useEffect(() => {
    const scan = () => {
      const video = document.querySelector('video');
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && window.jsQR) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            onQRScanned(code.data);
          }
        }
      }
      scannerRef.current = requestAnimationFrame(scan);
    };

    scannerRef.current = requestAnimationFrame(scan);
    return () => {
      if (scannerRef.current) cancelAnimationFrame(scannerRef.current);
    };
  }, [onQRScanned]);

  return (
    <a-scene
      vr-mode-ui="enabled: false"
      arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false;"
      renderer="antialias: true; alpha: true"
    >
      {/* The GPS Camera automatically tracks the user's real-world location and compass heading */}
      <a-camera gps-camera rotation-reader></a-camera>

      {/* Only render the 3D pin if navigation is active AND we have a valid target node */}
      {isActive && targetNode && (
        <a-entity 
          gps-entity-place={`latitude: ${targetNode.lat}; longitude: ${targetNode.lng};`}
        >
          {/* Bobbing up and down animation */}
          <a-entity animation="property: position; to: 0 2 0; dur: 1000; dir: alternate; loop: true">
            
            {/* A large pointing pin/cone */}
            <a-cone 
              position="0 4 0" 
              radius-bottom="1.5" 
              height="3" 
              color="#3b82f6" 
              rotation="180 0 0"
              opacity="0.9"
            ></a-cone>
            
            {/* The name of the next destination, configured to always face the camera */}
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