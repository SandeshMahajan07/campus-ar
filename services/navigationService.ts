import { CampusMap, CampusNode, NavigationPath } from '../types';

export const findShortestPath = (
  map: CampusMap,
  startId: string,
  endId: string
): NavigationPath | null => {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const nodes = new Set<string>();

  map.nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    nodes.add(node.id);
  });

  distances[startId] = 0;

  while (nodes.size > 0) {
    let closestNodeId: string | null = null;
    nodes.forEach((id) => {
      if (closestNodeId === null || distances[id] < distances[closestNodeId]) {
        closestNodeId = id;
      }
    });

    if (closestNodeId === null || distances[closestNodeId] === Infinity) break;
    if (closestNodeId === endId) break;

    nodes.delete(closestNodeId);

    const neighbors = map.edges.filter((e) => e.from === closestNodeId || e.to === closestNodeId);
    neighbors.forEach((edge) => {
      const neighborId = edge.from === closestNodeId ? edge.to : edge.from;
      const alt = distances[closestNodeId!] + edge.distance;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = closestNodeId;
      }
    });
  }

  const path: CampusNode[] = [];
  let u: string | null = endId;
  while (u !== null) {
    const node = map.nodes.find((n) => n.id === u);
    if (node) path.unshift(node);
    u = previous[u];
  }

  if (path.length > 0 && path[0].id === startId) {
    return {
      nodes: path,
      totalDistance: distances[endId],
    };
  }

  return null;
};

/**
 * Calculates the bearing between two lat/lng coordinates in degrees.
 * 0 is North, 90 is East, 180 is South, 270 is West.
 */
export const calculateBearing = (start: CampusNode, end: CampusNode): number => {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};