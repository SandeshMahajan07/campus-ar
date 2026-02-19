
import React, { useState, useCallback, useMemo } from 'react';
import ARViewer from './components/ARViewer';
import NavigationUI from './components/NavigationUI';
import { findShortestPath } from './services/navigationService';
import { CAMPUS_DATA } from './constants';
import { CampusNode, NavigationPath } from './types';

const App: React.FC = () => {
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<NavigationPath | null>(null);

  const startNavigation = useCallback((start: string, end: string) => {
    const path = findShortestPath(CAMPUS_DATA, start, end);
    if (path) {
      setCurrentLocationId(start);
      setDestinationId(end);
      setActivePath(path);
    } else {
      alert("No path found between these points.");
    }
  }, []);

  const resetNavigation = () => {
    setCurrentLocationId(null);
    setDestinationId(null);
    setActivePath(null);
  };

  const currentInstruction = useMemo(() => {
    if (!activePath || !currentLocationId) return null;
    
    // In a production app, we'd update this based on marker scanning
    // For this prototype, we show the next step in the sequence
    const currentIndex = activePath.nodes.findIndex(n => n.id === currentLocationId);
    if (currentIndex < activePath.nodes.length - 1) {
      const edge = CAMPUS_DATA.edges.find(
        e => e.from === currentLocationId && e.to === activePath.nodes[currentIndex + 1].id
      );
      return edge?.instruction || "Proceed to the next waypoint";
    }
    return "You have arrived!";
  }, [activePath, currentLocationId]);

  // Logic for the AR arrow orientation
  const arrowDirection = useMemo(() => {
    // Arbitrary rotation mapping for visual feedback in this prototype
    return (Date.now() / 100) % 360; 
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background AR Scene */}
      <ARViewer 
        isActive={!!activePath} 
        direction={arrowDirection} 
      />

      {/* Foreground UI */}
      <NavigationUI 
        onStartNavigation={startNavigation}
        onReset={resetNavigation}
        currentInstruction={currentInstruction}
        activePath={activePath?.nodes || null}
      />

      {/* Safety Overlay for First Time Users */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-[40] pointer-events-none">
        <div className="max-w-xs mx-auto bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] text-gray-400 text-center">
          Maintain awareness of your surroundings. Do not use while walking near stairs.
        </div>
      </div>
    </div>
  );
};

export default App;
