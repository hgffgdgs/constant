import { User, Report } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const demoUsers: User[] = [
  {
    id: uuidv4(),
    matricule: 'A001',
    firstName: 'Amadou',
    lastName: 'Traoré',
    role: 'agent',
    zone: 'Bamako',
    unit: 'Unité 1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: uuidv4(),
    matricule: 'S001',
    firstName: 'Fatou',
    lastName: 'Diallo',
    role: 'supervisor',
    zone: 'Bamako',
    unit: 'Unité 1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: uuidv4(),
    matricule: 'ADM001',
    firstName: 'Ibrahim',
    lastName: 'Keita',
    role: 'admin',
    zone: 'National',
    unit: 'Administration',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

export const demoReports: Report[] = [
  {
    id: uuidv4(),
    incidentType: 'accident',
    dateTime: '2024-01-15T14:30:00.000Z',
    location: {
      address: 'Avenue Modibo Keita, Bamako, Mali',
      coordinates: {
        latitude: 12.6392,
        longitude: -8.0029
      }
    },
    description: 'Accident de circulation impliquant deux véhicules. Pas de blessés graves.',
    involvedPersons: [
      {
        id: uuidv4(),
        name: 'Moussa Coulibaly',
        phone: '+223 70 12 34 56',
        status: 'victim',
        details: 'Conducteur du premier véhicule'
      },
      {
        id: uuidv4(),
        name: 'Aissata Sidibé',
        phone: '+223 75 98 76 54',
        status: 'witness',
        details: 'Témoin oculaire de l\'accident'
      }
    ],
    photos: [],
    audioNotes: [],
    status: 'completed',
    agentId: demoUsers[0].id,
    createdAt: '2024-01-15T14:45:00.000Z',
    updatedAt: '2024-01-15T15:00:00.000Z',
    isSynced: true
  },
  {
    id: uuidv4(),
    incidentType: 'theft',
    dateTime: '2024-01-16T09:15:00.000Z',
    location: {
      address: 'Marché de Medina Coura, Bamako, Mali',
      coordinates: {
        latitude: 12.6458,
        longitude: -8.0089
      }
    },
    description: 'Vol à l\'arraché d\'un téléphone portable au marché.',
    involvedPersons: [
      {
        id: uuidv4(),
        name: 'Mariam Sanogo',
        phone: '+223 66 55 44 33',
        status: 'victim',
        details: 'Victime du vol'
      }
    ],
    photos: [],
    audioNotes: [],
    status: 'pending',
    agentId: demoUsers[0].id,
    createdAt: '2024-01-16T09:30:00.000Z',
    updatedAt: '2024-01-16T09:30:00.000Z',
    isSynced: false
  },
  {
    id: uuidv4(),
    incidentType: 'disturbance',
    dateTime: '2024-01-17T22:00:00.000Z',
    location: {
      address: 'Quartier Hamdallaye, Bamako, Mali',
      coordinates: {
        latitude: 12.6711,
        longitude: -7.9803
      }
    },
    description: 'Trouble de l\'ordre public - rassemblement non autorisé.',
    involvedPersons: [
      {
        id: uuidv4(),
        name: 'Sekou Touré',
        phone: '+223 78 88 99 00',
        status: 'suspect',
        details: 'Organisateur présumé'
      }
    ],
    photos: [],
    audioNotes: [],
    status: 'draft',
    agentId: demoUsers[1].id,
    createdAt: '2024-01-17T22:15:00.000Z',
    updatedAt: '2024-01-17T22:15:00.000Z',
    isSynced: false
  }
];

export async function loadDemoData() {
  // This function can be called to populate the app with demo data
  const { OfflineStorageService } = await import('../services/offlineStorage');
  
  // Save demo reports
  for (const report of demoReports) {
    await OfflineStorageService.saveReport(report);
  }
  
  console.log('Demo data loaded successfully');
}