
export interface CampusNode {
  id: string;
  name: string;
  floor: number;
  lat: number;
  lng: number;
  description: string;
  type: 'entrance' | 'room' | 'junction' | 'stairs' | 'elevator' | 'parking';
}

export interface Edge {
  from: string;
  to: string;
  distance: number;
  instruction: string;
}

export interface CampusMap {
  nodes: CampusNode[];
  edges: Edge[];
}

export interface NavigationPath {
  nodes: CampusNode[];
  totalDistance: number;
}
