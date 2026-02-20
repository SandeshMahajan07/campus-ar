
import { CampusMap } from './types';

export const CAMPUS_DATA: CampusMap = {
  nodes: [
    { id: 'MAIN_GATE', name: 'Main Gate', floor: 0, lat: 17.31554902420121, lng: 76.83301794475705, description: 'University Entrance', type: 'entrance' },
    { id: 'BOYS_PARKING', name: 'Boys Parking', floor: 0, lat: 17.315587380642484, lng: 76.83355851176708, description: 'Parking area near gate', type: 'parking' },
    { id: 'MAIN_BLDG', name: 'Main Building', floor: 0, lat: 17.315180652010394, lng: 76.83389045305594, description: 'Iconic main campus structure', type: 'room' },
    { id: 'CSE_DEPT', name: 'CSE Department', floor: 0, lat: 17.3154975168783, lng: 76.83408580373516, description: 'Computer Science block', type: 'room' },
    { id: 'GIRLS_PARKING', name: 'Girls Parking', floor: 0, lat: 17.315720748480366, lng: 76.83416032052583, description: 'Secure parking area', type: 'parking' },
    { id: 'INTERSECTION', name: 'Chaurashta', floor: 0, lat: 17.31528977030924, lng: 76.83465437632567, description: 'Major central junction', type: 'junction' },
    { id: 'CANARA_BANK', name: 'Canara Bank', floor: 0, lat: 17.314952508967227, lng: 76.83452581691554, description: 'On-campus banking', type: 'room' },
    { id: 'ADMIN_BLOCK', name: 'Administrative Block', floor: 0, lat: 17.314595808553634, lng: 76.83432856962781, description: 'University Administration', type: 'room' },
    { id: 'CENTRAL_LIB', name: 'Central Library', floor: 0, lat: 17.314689963043683, lng: 76.83469082185825, description: 'Knowledge hub', type: 'room' },
    { id: 'EEE_DEPT', name: 'EEE Department', floor: 0, lat: 17.31559891352173, lng: 76.83502272835193, description: 'Electrical Eng (Ground Floor)', type: 'room' },
    { id: 'ECE_DEPT', name: 'ECE Department', floor: 1, lat: 17.31559891352173, lng: 76.83502272835193, description: 'Electronics Eng (1st Floor)', type: 'room' },
    { id: 'CIVIL_DEPT', name: 'Civil Dept', floor: 0, lat: 17.315005018101516, lng: 76.83501514191772, description: 'Civil Engineering block', type: 'room' },
    { id: 'CSE_NEW', name: 'CSE New Centre', floor: 1, lat: 17.3155518365157, lng: 76.83541911953587, description: 'New CS Research Wing', type: 'room' },
    { id: 'ISE_DEPT', name: 'ISE Department', floor: 0, lat: 17.31526213160065, lng: 76.83543808562122, description: 'Info Science (Ground Floor)', type: 'room' },
    { id: 'AIML_DEPT', name: 'AIML Department', floor: 1, lat: 17.31526213160065, lng: 76.83543808562122, description: 'AI & ML (1st Floor)', type: 'room' },
    { id: 'CANTEEN', name: 'PDA Canteen', floor: 0, lat: 17.31455597394546, lng: 76.83565240238575, description: 'Student Refreshments', type: 'room' },
    { id: 'ARCH_DEPT', name: 'Architecture Dept', floor: 0, lat: 17.314081000688077, lng: 76.83554573578573, description: 'Architecture block', type: 'room' },
    { id: 'FIRST_YEAR', name: 'First Year Block', floor: 0, lat: 17.31471787465323, lng: 76.8361048844022, description: 'Freshman building', type: 'room' },
    { id: 'MECH_BLOCK', name: 'Mechanical Block', floor: 0, lat: 17.315404956126716, lng: 76.8356633784402, description: 'Mechanical Eng wing', type: 'room' },
    { id: 'PHYSICS_DEPT', name: 'Physics Department', floor: 0, lat: 17.31480508128869, lng: 76.83581423784419, description: 'Science block', type: 'room' },
    { id: 'SAC_BLDG', name: 'SAC Building', floor: 0, lat: 17.313930370422916, lng: 76.83635539405459, description: 'Student Activity Center', type: 'room' },
  ],
  edges: [
    { from: 'MAIN_GATE', to: 'BOYS_PARKING', distance: 30, instruction: 'Head East toward Boys Parking' },
    { from: 'BOYS_PARKING', to: 'MAIN_BLDG', distance: 60, instruction: 'Walk forward to the Main Building' },
    { from: 'MAIN_BLDG', to: 'INTERSECTION', distance: 80, instruction: 'Proceed straight to the Intersection (Chaurashta)' },
    { from: 'INTERSECTION', to: 'CSE_DEPT', distance: 40, instruction: 'Turn slightly Left for CSE' },
    { from: 'INTERSECTION', to: 'CANARA_BANK', distance: 30, instruction: 'Turn Right for Canara Bank' },
    { from: 'INTERSECTION', to: 'CENTRAL_LIB', distance: 50, instruction: 'Walk toward the Central Library' },
    { from: 'INTERSECTION', to: 'EEE_DEPT', distance: 60, instruction: 'Head toward the Electrical/Electronics block' },
    { from: 'EEE_DEPT', to: 'ECE_DEPT', distance: 5, instruction: 'Go up to the First Floor for ECE' },
    { from: 'INTERSECTION', to: 'ISE_DEPT', distance: 70, instruction: 'Proceed toward the ISE/AIML block' },
    { from: 'ISE_DEPT', to: 'AIML_DEPT', distance: 5, instruction: 'Go up to the First Floor for AIML' },
    { from: 'INTERSECTION', to: 'CANTEEN', distance: 100, instruction: 'Follow the path south to the Canteen' },
    { from: 'CANTEEN', to: 'MECH_BLOCK', distance: 60, instruction: 'Walk East to Mechanical Block' },
    { from: 'MECH_BLOCK', to: 'CSE_NEW', distance: 20, instruction: 'Go up to the First Floor for New CSE Centre' },
    { from: 'CANTEEN', to: 'ARCH_DEPT', distance: 50, instruction: 'Head South to Architecture' },
    { from: 'CANTEEN', to: 'SAC_BLDG', distance: 110, instruction: 'Follow the main path to the SAC Building' },
    { from: 'INTERSECTION', to: 'MAIN_BLDG', distance: 80, instruction: 'Return toward the Main Building' },
    { from: 'BOYS_PARKING', to: 'MAIN_GATE', distance: 30, instruction: 'Head back to the Main Gate' }
  ]
};
