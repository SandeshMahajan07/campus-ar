
import React, { useState, useCallback, useMemo } from 'react';
import ARViewer from './components/ARViewer';
import NavigationUI from './components/NavigationUI';
import { findShortestPath } from './services/navigationService';
import { CAMPUS_DATA } from './constants';
import { NavigationPath } from './types';

const App: React.FC = () => {
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<NavigationPath | null>(null);
  const [compassPermissionGranted, setCompassPermissionGranted] = useState(false);

  const startNavigation = useCallback((start: string | null, end: string) => {
    // If we don't have a start yet, we just set the destination and wait for a QR scan
    setDestinationId(end);
    if (start) {
      const path = findShortestPath(CAMPUS_DATA, start, end);
      if (path) {
        setActivePath(path);
      }
    }
  }, []);

  const handleQRScanned = useCallback((qrData: string) => {
    // Check if the QR data matches a node ID
    const detectedNode = CAMPUS_DATA.nodes.find(n => n.id === qrData);
    if (detectedNode && detectedNode.id !== currentLocationId) {
      setCurrentLocationId(detectedNode.id);
      
      // If we already have a destination, recalculate path from this new scan
      if (destinationId) {
        const path = findShortestPath(CAMPUS_DATA, detectedNode.id, destinationId);
        if (path) {
          setActivePath(path);
        }
      }
    }
  }, [currentLocationId, destinationId]);

  const requestCompassPermission = async () => {
    // Required for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setCompassPermissionGranted(true);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCompassPermissionGranted(true);
    }
  };

  const currentInstruction = useMemo(() => {
    if (!activePath || !currentLocationId) return "Point camera at a location QR code...";
    
    const currentIndex = activePath.nodes.findIndex(n => n.id === currentLocationId);

    // Guard: if the scanned node isn't on the active path, don't give a wrong instruction
    if (currentIndex === -1) return "Scan a QR code along your route to continue...";

    if (currentIndex < activePath.nodes.length - 1) {
      const nextNode = activePath.nodes[currentIndex + 1];
      // Check both directions since edges are bidirectional
      const edge = CAMPUS_DATA.edges.find(
        e => (e.from === currentLocationId && e.to === nextNode.id) ||
             (e.to === currentLocationId && e.from === nextNode.id)
      );
      
      let instruction = edge?.instruction || "Proceed to the next waypoint";
      if (nextNode.floor > 0) {
        instruction += ` (Floor ${nextNode.floor})`;
      }
      return instruction;
    }
    return "You have arrived!";
  }, [activePath, currentLocationId]);

  const targetNode = useMemo(() => {
    if (!activePath || !currentLocationId) return null;
    const currentIndex = activePath.nodes.findIndex(n => n.id === currentLocationId);
    
    if (currentIndex < activePath.nodes.length - 1) {
      return activePath.nodes[currentIndex + 1]; // The next waypoint
    }
    return activePath.nodes[activePath.nodes.length - 1]; // The final destination
  }, [activePath, currentLocationId]);

  const resetNavigation = () => {
    setCurrentLocationId(null);
    setDestinationId(null);
    setActivePath(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ARViewer 
        isActive={!!activePath} 
        targetNode={targetNode}
        onQRScanned={handleQRScanned}
      />

      <NavigationUI 
        onStartNavigation={(s, e) => startNavigation(s, e)}
        onReset={resetNavigation}
        currentInstruction={currentInstruction}
        activePath={activePath?.nodes || null}
        isWaitingForScan={!!destinationId && !currentLocationId}
      />

      {!compassPermissionGranted && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 text-center">
          <div className="bg-gray-800 p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold">Calibrate Compass</h2>
            <p className="text-sm text-gray-400">To point the arrow correctly, we need access to your device's orientation sensors.</p>
            <button 
              onClick={requestCompassPermission}
              className="w-full py-3 bg-blue-600 rounded-xl font-bold"
            >
              Enable Compass
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 z-[40] pointer-events-none">
        <div className="max-w-xs mx-auto bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] text-gray-400 text-center">
          {currentLocationId ? `Located at: ${CAMPUS_DATA.nodes.find(n => n.id === currentLocationId)?.name}` : "Scanning for QR location..."}
        </div>
      </div>
    </div>
  );
};

export default App;
