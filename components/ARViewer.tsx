
import React, { useEffect } from 'react';

// Correctly augment the React.JSX namespace to resolve intrinsic element errors for A-Frame tags.
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'a-scene': any;
        'a-marker': any;
        'a-entity': any;
        'a-cylinder': any;
        'a-cone': any;
        'a-text': any;
      }
    }
  }
}

interface ARViewerProps {
  isActive: boolean;
  direction: number; // 0-360 degrees for the arrow
}

const ARViewer: React.FC<ARViewerProps> = ({ isActive, direction }) => {
  useEffect(() => {
    // Force re-init of AR.js if needed or handle cleanup
  }, [isActive]);

  return (
    <a-scene
      embedded
      arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
      vr-mode-ui="enabled: false"
      renderer="antialias: true; alpha: true; precision: medium;"
    >
      {/* 
          In a real-world alumni app, we'd use hiro markers or custom QR markers 
          at checkpoints. For this MVP, we use the standard 'hiro' marker to show the arrow.
      */}
      <a-marker preset="hiro">
        {isActive && (
          <a-entity 
            rotation={`0 ${direction} 0`}
            animation="property: position; to: 0 0.5 0; dur: 1500; dir: alternate; loop: true"
          >
            {/* 3D Arrow Design */}
            <a-entity id="arrow">
              {/* Shaft */}
              <a-cylinder 
                position="0 0.5 0" 
                radius="0.1" 
                height="1" 
                color="#3b82f6"
              ></a-cylinder>
              {/* Tip */}
              <a-cone 
                position="0 1.2 0" 
                radius-bottom="0.3" 
                height="0.6" 
                color="#60a5fa"
              ></a-cone>
            </a-entity>
            
            <a-text 
              value="FOLLOW ME" 
              position="0 1.8 0" 
              align="center" 
              width="4"
              color="#ffffff"
            ></a-text>
          </a-entity>
        )}
      </a-marker>

      <a-entity camera></a-entity>
    </a-scene>
  );
};

export default ARViewer;
