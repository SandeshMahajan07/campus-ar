
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

    const neighbors = map.edges.filter((e) => e.from === closestNodeId);
    neighbors.forEach((edge) => {
      const alt = distances[closestNodeId!] + edge.distance;
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
        previous[edge.to] = closestNodeId;
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
