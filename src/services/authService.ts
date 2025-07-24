import { supabase, TABLES } from '../lib/supabase';
import { User, LoginCredentials, ApiResponse } from '../types';
import { OfflineStorageService } from './offlineStorage';
import { demoUsers } from '../utils/demoData';

export class AuthService {
  
  static async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // For demo purposes, use demo users
      const demoUser = demoUsers.find(u => u.matricule === credentials.matricule);
      
      if (!demoUser) {
        return {
          success: false,
          error: 'Matricule ou mot de passe incorrect',
          data: null as any
        };
      }

      // Simple password check for demo
      if (credentials.password !== 'demo123') {
        return {
          success: false,
          error: 'Matricule ou mot de passe incorrect',
          data: null as any
        };
      }

      const user: User = {
        ...demoUser,
        lastLogin: new Date().toISOString()
      };

      // Generate JWT token
      const token = this.generateToken(user);

      // Save user offline for offline access
      await OfflineStorageService.saveUser(user);

      return {
        success: true,
        data: { user, token }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Erreur de connexion',
        data: null as any
      };
    }
  }

  // private static async offlineLogin(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
  //   const savedUser = await OfflineStorageService.getUser();
  //   
  //   if (!savedUser || savedUser.matricule !== credentials.matricule) {
  //     return {
  //       success: false,
  //       error: 'Aucune session hors ligne disponible pour ce matricule',
  //       data: null as any
  //     };
  //   }

  //   // In offline mode, we'll allow access with a simplified password check
  //   // In a production app, you'd store a hashed password locally
  //   if (credentials.password === 'demo123' || credentials.password === savedUser.matricule) {
  //     const token = this.generateToken(savedUser);
  //     return {
  //       success: true,
  //       data: { user: savedUser, token }
  //     };
  //   }

  //   return {
  //     success: false,
  //     error: 'Mot de passe incorrect',
  //     data: null as any
  //   };
  // }

  static async logout(): Promise<void> {
    await OfflineStorageService.clearUser();
    localStorage.removeItem('tamboura-token');
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('tamboura-token');
    if (!token) return null;

    try {
      const user = this.verifyToken(token);
      return user;
    } catch {
      return null;
    }
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([{
          matricule: userData.matricule,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          zone: userData.zone,
          unit: userData.unit,
          isActive: userData.isActive,
          passwordHash: await this.hashPassword('demo123'), // Default password
          createdAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Erreur lors de la création de l\'utilisateur',
          data: null as any
        };
      }

      const user: User = {
        id: data.id,
        matricule: data.matricule,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        zone: data.zone,
        unit: data.unit,
        isActive: data.isActive,
        createdAt: data.createdAt
      };

      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création de l\'utilisateur',
        data: null as any
      };
    }
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Erreur lors de la mise à jour',
          data: null as any
        };
      }

      return {
        success: true,
        data: data as User
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour',
        data: null as any
      };
    }
  }

  static async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        return {
          success: false,
          error: 'Erreur lors du chargement des utilisateurs',
          data: []
        };
      }

      return {
        success: true,
        data: data as User[]
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du chargement des utilisateurs',
        data: []
      };
    }
  }

  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = { 'agent': 1, 'supervisor': 2, 'admin': 3 };
    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  }

  private static generateToken(user: User): string {
    const payload = {
      id: user.id,
      matricule: user.matricule,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // Simple JWT-like token (in production, use a proper JWT library)
    const token = btoa(JSON.stringify(payload));
    localStorage.setItem('tamboura-token', token);
    return token;
  }

  private static verifyToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        throw new Error('Token expired');
      }
      return payload;
    } catch {
      return null;
    }
  }

  private static async hashPassword(password: string): Promise<string> {
    // Simple hash for demo (use bcrypt or similar in production)
    return btoa(password);
  }

  // private static async verifyPassword(password: string, hash: string): Promise<boolean> {
  //   // Simple verification for demo
  //   return btoa(password) === hash || password === 'demo123';
  // }
}