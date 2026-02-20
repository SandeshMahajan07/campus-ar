import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ARViewer from './components/ARViewer';
import NavigationUI from './components/NavigationUI';
import MiniMap from './components/MiniMap';
import DirectionArrow from './components/DirectionArrow';
import { findShortestPath, calculateBearing } from './services/navigationService';
import { DeadReckoning, Position } from './services/deadReckoning';
import { CAMPUS_DATA } from './constants';
import { NavigationPath } from './types';

const App: React.FC = () => {
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<NavigationPath | null>(null);
  const [compassPermissionGranted, setCompassPermissionGranted] = useState(false);

  // Dead reckoning estimated position (updated on every step)
  const [estimatedPosition, setEstimatedPosition] = useState<Position | null>(null);

  // Live compass heading for the direction arrow
  const [deviceHeading, setDeviceHeading] = useState<number>(0);

  // Dead reckoning service instance — persists across renders
  const drRef = useRef<DeadReckoning | null>(null);

  // ── Start dead reckoning service once on mount ──
  useEffect(() => {
    const dr = new DeadReckoning();
    drRef.current = dr;
    dr.start((pos) => setEstimatedPosition(pos));
    return () => dr.stop();
  }, []);

  // ── Compass heading for DirectionArrow ──
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const h = (e as any).webkitCompassHeading
        ?? (e.alpha !== null ? (360 - e.alpha) % 360 : null);
      if (h !== null) setDeviceHeading(h);
    };
    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);

  // ── GPS watch — feeds raw GPS to mini map, dead reckoning uses its own sensors ──
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        // If dead reckoning has drifted a lot from GPS, gently correct it
        // Only apply GPS correction if accuracy is reasonable (< 20m)
        if (pos.coords.accuracy < 20 && drRef.current?.getPosition()?.accuracy === 'estimated') {
          drRef.current?.resetToExact(pos.coords.latitude, pos.coords.longitude);
        }
        // Always update estimated position with raw GPS as fallback
        if (!drRef.current?.getPosition()) {
          setEstimatedPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: 'exact',
            stepCount: 0,
          });
        }
      },
      (err) => console.error('GPS:', err),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const startNavigation = useCallback((start: string | null, end: string) => {
    setDestinationId(end);
    if (start) {
      const path = findShortestPath(CAMPUS_DATA, start, end);
      if (path) setActivePath(path);
    }
  }, []);

  const handleQRScanned = useCallback((qrData: string) => {
    const detectedNode = CAMPUS_DATA.nodes.find(n => n.id === qrData);
    if (detectedNode && detectedNode.id !== currentLocationId) {
      setCurrentLocationId(detectedNode.id);

      // ── RESET dead reckoning to this exact known position ──
      drRef.current?.resetToExact(detectedNode.lat, detectedNode.lng);

      if (destinationId) {
        const path = findShortestPath(CAMPUS_DATA, detectedNode.id, destinationId);
        if (path) setActivePath(path);
      }
    }
  }, [currentLocationId, destinationId]);

  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') setCompassPermissionGranted(true);
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
    if (currentIndex === -1) return "Scan a QR code along your route to continue...";
    if (currentIndex < activePath.nodes.length - 1) {
      const nextNode = activePath.nodes[currentIndex + 1];
      const edge = CAMPUS_DATA.edges.find(
        e => (e.from === currentLocationId && e.to === nextNode.id) ||
             (e.to === currentLocationId && e.from === nextNode.id)
      );
      let instruction = edge?.instruction || "Proceed to the next waypoint";
      if (nextNode.floor > 0) instruction += ` (Floor ${nextNode.floor})`;
      return instruction;
    }
    return "You have arrived!";
  }, [activePath, currentLocationId]);

  const targetNode = useMemo(() => {
    if (!activePath || !currentLocationId) return null;
    const currentIndex = activePath.nodes.findIndex(n => n.id === currentLocationId);
    if (currentIndex < activePath.nodes.length - 1) return activePath.nodes[currentIndex + 1];
    return activePath.nodes[activePath.nodes.length - 1];
  }, [activePath, currentLocationId]);

  // Bearing from estimated position → target node
  const bearingToTarget = useMemo(() => {
    if (!targetNode || !estimatedPosition) return null;
    return calculateBearing(
      { lat: estimatedPosition.lat, lng: estimatedPosition.lng } as any,
      targetNode
    );
  }, [targetNode, estimatedPosition]);

  // Live distance using estimated (dead reckoned) position
  const distanceToTarget = useMemo(() => {
    if (!targetNode || !estimatedPosition) return null;
    const R = 6371000;
    const dLat = ((targetNode.lat - estimatedPosition.lat) * Math.PI) / 180;
    const dLng = ((targetNode.lng - estimatedPosition.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((estimatedPosition.lat * Math.PI) / 180) *
        Math.cos((targetNode.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }, [targetNode, estimatedPosition]);

  const resetNavigation = () => {
    setCurrentLocationId(null);
    setDestinationId(null);
    setActivePath(null);
    setEstimatedPosition(null);
  };

  const isArrived = currentInstruction === "You have arrived!";
  const isNavigating = !!activePath && !!currentLocationId && !isArrived;

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

      {/* Direction Arrow — compass-driven, shows while navigating */}
      {isNavigating && bearingToTarget !== null && (
        <DirectionArrow
          bearingToTarget={bearingToTarget}
          deviceHeading={deviceHeading}
          targetName={targetNode?.name ?? ''}
          distance={distanceToTarget}
          accuracy={estimatedPosition?.accuracy ?? 'estimated'}
        />
      )}

      {/* Mini Map */}
      {activePath && currentLocationId && (
        <MiniMap
          currentLocationId={currentLocationId}
          activePath={activePath.nodes}
          targetNode={targetNode}
          userGPS={estimatedPosition ? { lat: estimatedPosition.lat, lng: estimatedPosition.lng } : null}
        />
      )}

      {!compassPermissionGranted && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 text-center">
          <div className="bg-gray-800 p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold">Enable Sensors</h2>
            <p className="text-sm text-gray-400">
              We need your compass and motion sensors to show the direction arrow and track your steps between QR scans.
            </p>
            <button
              onClick={requestCompassPermission}
              className="w-full py-3 bg-blue-600 rounded-xl font-bold"
            >
              Enable Compass & Motion
            </button>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-[40] pointer-events-none">
        <div className="max-w-xs mx-auto bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] text-gray-400 text-center">
          {currentLocationId
            ? `📍 ${CAMPUS_DATA.nodes.find(n => n.id === currentLocationId)?.name}${estimatedPosition?.accuracy === 'estimated' ? ` · ~${estimatedPosition.stepCount} steps` : ''}`
            : 'Scanning for QR location...'}
        </div>
      </div>
    </div>
  );
};

export default App;