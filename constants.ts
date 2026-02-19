
import { CampusMap } from './types';

export const CAMPUS_DATA: CampusMap = {
  nodes: [
    { id: 'ENT', name: 'Main Entrance', floor: 1, description: 'Lobby area with the university crest', type: 'entrance' },
    { id: 'J1', name: 'West Corridor Junction', floor: 1, description: 'Near the cafeteria entrance', type: 'junction' },
    { id: 'AUD', name: 'Grand Auditorium', floor: 1, description: 'Main hall for keynote speeches', type: 'room' },
    { id: 'LAB1', name: 'Robotics Lab', floor: 1, description: 'Department of Engineering research wing', type: 'room' },
    { id: 'OFF1', name: 'Alumni Affairs Office', floor: 1, description: 'Welcome center for returning graduates', type: 'room' },
    { id: 'ST1', name: 'Central Staircase', floor: 1, description: 'Connects to Floor 2', type: 'stairs' },
  ],
  edges: [
    { from: 'ENT', to: 'J1', distance: 15, instruction: 'Walk straight ahead toward the junction' },
    { from: 'J1', to: 'AUD', distance: 20, instruction: 'Turn left for the Grand Auditorium' },
    { from: 'J1', to: 'OFF1', distance: 10, instruction: 'Turn right for Alumni Affairs' },
    { from: 'ENT', to: 'LAB1', distance: 25, instruction: 'Take the right-side hallway past the lounge' },
    { from: 'J1', to: 'ST1', distance: 12, instruction: 'Continue past the junction to the stairs' },
    // Bidirectional edges for mapping
    { from: 'J1', to: 'ENT', distance: 15, instruction: 'Walk back to the main entrance' },
    { from: 'AUD', to: 'J1', distance: 20, instruction: 'Exit the hall and return to the junction' },
    { from: 'OFF1', to: 'J1', distance: 10, instruction: 'Exit the office and return to the junction' },
    { from: 'LAB1', to: 'ENT', distance: 25, instruction: 'Return to the main lobby' },
    { from: 'ST1', to: 'J1', distance: 12, instruction: 'Head back toward the main hallway' },
  ]
};
