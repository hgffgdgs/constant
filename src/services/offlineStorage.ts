import localforage from 'localforage';
import { Report, Photo, AudioNote, User } from '../types';

// Configure localforage instances
const reportsStore = localforage.createInstance({
  name: 'tamboura-reports',
  description: 'Offline reports storage'
});

const mediaStore = localforage.createInstance({
  name: 'tamboura-media',
  description: 'Offline media storage'
});

const userStore = localforage.createInstance({
  name: 'tamboura-user',
  description: 'User data storage'
});

const syncStore = localforage.createInstance({
  name: 'tamboura-sync',
  description: 'Sync queue storage'
});

export class OfflineStorageService {
  // Reports management
  static async saveReport(report: Report): Promise<void> {
    await reportsStore.setItem(report.id, report);
  }

  static async getReport(id: string): Promise<Report | null> {
    return await reportsStore.getItem(id);
  }

  static async getAllReports(): Promise<Report[]> {
    const reports: Report[] = [];
    await reportsStore.iterate((value: Report) => {
      reports.push(value);
    });
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async deleteReport(id: string): Promise<void> {
    await reportsStore.removeItem(id);
  }

  static async getUnsyncedReports(): Promise<Report[]> {
    const reports = await this.getAllReports();
    return reports.filter(report => !report.isSynced);
  }

  // Media management
  static async savePhoto(photo: Photo, blob: Blob): Promise<void> {
    await mediaStore.setItem(`photo-${photo.id}`, blob);
    await mediaStore.setItem(`photo-meta-${photo.id}`, photo);
  }

  static async getPhoto(id: string): Promise<{ blob: Blob; meta: Photo } | null> {
    const blob = await mediaStore.getItem<Blob>(`photo-${id}`);
    const meta = await mediaStore.getItem<Photo>(`photo-meta-${id}`);
    if (blob && meta) {
      return { blob, meta };
    }
    return null;
  }

  static async saveAudio(audio: AudioNote, blob: Blob): Promise<void> {
    await mediaStore.setItem(`audio-${audio.id}`, blob);
    await mediaStore.setItem(`audio-meta-${audio.id}`, audio);
  }

  static async getAudio(id: string): Promise<{ blob: Blob; meta: AudioNote } | null> {
    const blob = await mediaStore.getItem<Blob>(`audio-${id}`);
    const meta = await mediaStore.getItem<AudioNote>(`audio-meta-${id}`);
    if (blob && meta) {
      return { blob, meta };
    }
    return null;
  }

  // User management
  static async saveUser(user: User): Promise<void> {
    await userStore.setItem('currentUser', user);
  }

  static async getUser(): Promise<User | null> {
    return await userStore.getItem('currentUser');
  }

  static async clearUser(): Promise<void> {
    await userStore.removeItem('currentUser');
  }

  // Sync queue management
  static async addToSyncQueue(item: { type: string; data: any; timestamp: string }): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(item);
    await syncStore.setItem('syncQueue', queue);
  }

  static async getSyncQueue(): Promise<any[]> {
    return (await syncStore.getItem('syncQueue')) || [];
  }

  static async clearSyncQueue(): Promise<void> {
    await syncStore.setItem('syncQueue', []);
  }

  static async removeFromSyncQueue(index: number): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.splice(index, 1);
    await syncStore.setItem('syncQueue', queue);
  }

  // Settings management
  static async saveSettings(settings: any): Promise<void> {
    await userStore.setItem('appSettings', settings);
  }

  static async getSettings(): Promise<any> {
    return await userStore.getItem('appSettings') || {
      language: 'fr',
      autoSync: true,
      offlineMode: false,
      notifications: true
    };
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    await Promise.all([
      reportsStore.clear(),
      mediaStore.clear(),
      userStore.clear(),
      syncStore.clear()
    ]);
  }

  // Get storage usage info
  static async getStorageInfo(): Promise<{
    reportsCount: number;
    mediaCount: number;
    syncQueueLength: number;
  }> {
    const reports = await this.getAllReports();
    const syncQueue = await this.getSyncQueue();
    
    let mediaCount = 0;
    await mediaStore.iterate(() => {
      mediaCount++;
    });

    return {
      reportsCount: reports.length,
      mediaCount: Math.floor(mediaCount / 2), // Each media item has meta + blob
      syncQueueLength: syncQueue.length
    };
  }
}