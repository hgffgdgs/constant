export interface User {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  role: 'agent' | 'supervisor' | 'admin';
  zone?: string;
  unit?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Report {
  id: string;
  incidentType: IncidentType;
  dateTime: string;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  description: string;
  involvedPersons: InvolvedPerson[];
  photos: Photo[];
  audioNotes: AudioNote[];
  agentSignature?: string;
  witnessSignature?: string;
  status: 'draft' | 'pending' | 'completed' | 'signed';
  agentId: string;
  createdAt: string;
  updatedAt: string;
  isSynced: boolean;
  pdfUrl?: string;
}

export interface InvolvedPerson {
  id: string;
  name: string;
  phone?: string;
  status: 'victim' | 'witness' | 'suspect' | 'other';
  details?: string;
}

export interface Photo {
  id: string;
  url: string;
  localUrl?: string;
  caption?: string;
  timestamp: string;
}

export interface AudioNote {
  id: string;
  url: string;
  localUrl?: string;
  duration: number;
  timestamp: string;
  transcription?: string;
}

export type IncidentType = 
  | 'accident'
  | 'theft'
  | 'assault'
  | 'vandalism'
  | 'disturbance'
  | 'fire'
  | 'medical'
  | 'other';

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  completedReports: number;
  recentActivity: ReportActivity[];
}

export interface ReportActivity {
  reportId: string;
  action: 'created' | 'updated' | 'signed' | 'exported';
  timestamp: string;
  agentName: string;
}

export interface AppSettings {
  language: 'fr' | 'bm';
  autoSync: boolean;
  offlineMode: boolean;
  notifications: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync?: string;
  pendingUploads: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  matricule: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}