import React, { useEffect, useRef, useState } from 'react';

declare global {
  var jsQR: any;
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'a-scene': any;
        'a-marker': any;
        'a-entity': any;
        'a-cylinder': any;
        'a-cone': any;
        'a-text': any;
        'a-camera': any;
      }
    }
  }
}

interface ARViewerProps {
  isActive: boolean;
  targetBearing: number;
  onQRScanned: (data: string) => void;
}

const ARViewer: React.FC<ARViewerProps> = ({ isActive, targetBearing, onQRScanned }) => {
  const [heading, setHeading] = useState(0);
  const scannerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleOrientation = (e: any) => {
      let rawHeading = 0;
      if (e.webkitCompassHeading) {
        rawHeading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        // alpha is 0..360, representing the rotation around the z-axis
        rawHeading = 360 - e.alpha;
      }
      setHeading(rawHeading);
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

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

  // Relative rotation logic for the navigation arrow
  const arrowRotation = (targetBearing - heading + 360) % 360;

  return (
    <a-scene
      embedded
      arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best;"
      vr-mode-ui="enabled: false"
      renderer="logarithmicDepthBuffer: true; antialias: true; alpha: true;"
    >
      <a-marker preset="hiro">
        {isActive && (
          <a-entity 
            rotation={`0 ${arrowRotation} 0`}
            animation="property: position; to: 0 0.5 0; dur: 1000; dir: alternate; loop: true"
          >
            <a-entity id="arrow">
              <a-cylinder position="0 0.5 0" radius="0.1" height="1" color="#3b82f6"></a-cylinder>
              <a-cone position="0 1.2 0" radius-bottom="0.3" height="0.6" color="#60a5fa"></a-cone>
            </a-entity>
            <a-text value="DESTINATION" position="0 1.8 0" align="center" width="4" color="#ffffff"></a-text>
          </a-entity>
        )}
      </a-marker>
      
      {/* Standard AR.js Camera setup */}
      <a-entity camera></a-entity>
    </a-scene>
  );
};

export default ARViewer;