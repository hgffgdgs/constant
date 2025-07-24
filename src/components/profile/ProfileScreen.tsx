import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation } from '../layout/Navigation';
import { User, Globe, Database, Smartphone } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="p-4 pb-24">
        <h1 className="text-2xl font-bold text-white mb-6">{t('navigation.profile')}</h1>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <User className="text-tamboura-500" size={24} />
              <h2 className="text-lg font-bold text-white">Informations personnelles</h2>
            </div>
            
            {user && (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Nom complet:</span>
                  <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Matricule:</span>
                  <div className="text-white">{user.matricule}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Rôle:</span>
                  <div className="text-white">{t(`roles.${user.role}`)}</div>
                </div>
                {user.zone && (
                  <div>
                    <span className="text-gray-400 text-sm">Zone:</span>
                    <div className="text-white">{user.zone}</div>
                  </div>
                )}
                {user.unit && (
                  <div>
                    <span className="text-gray-400 text-sm">Unité:</span>
                    <div className="text-white">{user.unit}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Settings */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="text-tamboura-500" size={24} />
              <h2 className="text-lg font-bold text-white">Langue</h2>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  localStorage.setItem('i18nextLng', 'fr');
                  window.location.reload();
                }}
                className={`w-full p-3 rounded-lg border text-left ${
                  localStorage.getItem('i18nextLng') === 'fr' 
                    ? 'border-tamboura-500 bg-tamboura-500/10' 
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <div className="text-white font-medium">Français</div>
                <div className="text-gray-400 text-sm">Langue française</div>
              </button>
              
              <button
                onClick={() => {
                  localStorage.setItem('i18nextLng', 'bm');
                  window.location.reload();
                }}
                className={`w-full p-3 rounded-lg border text-left ${
                  localStorage.getItem('i18nextLng') === 'bm' 
                    ? 'border-tamboura-500 bg-tamboura-500/10' 
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <div className="text-white font-medium">Bambara</div>
                <div className="text-gray-400 text-sm">Kan bambara</div>
              </button>
            </div>
          </div>

          {/* App Settings */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Smartphone className="text-tamboura-500" size={24} />
              <h2 className="text-lg font-bold text-white">Paramètres de l'application</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Synchronisation automatique</div>
                  <div className="text-gray-400 text-sm">Synchroniser dès qu'une connexion est disponible</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Notifications</div>
                  <div className="text-gray-400 text-sm">Recevoir des notifications</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="text-tamboura-500" size={24} />
              <h2 className="text-lg font-bold text-white">Stockage local</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Constats stockés:</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Photos stockées:</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">En attente de sync:</span>
                <span className="text-orange-400">0</span>
              </div>
              
              <button className="btn-secondary w-full mt-4">
                Vider le cache
              </button>
            </div>
          </div>

          {/* Version Info */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4">À propos</h2>
            
            <div className="space-y-2 text-center">
              <div className="text-tamboura-500 font-bold text-xl">TAMBOURA</div>
              <div className="text-gray-400 text-sm">Version 1.0.0</div>
              <div className="text-gray-500 text-xs">
                Application de constats d'intervention numériques
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};