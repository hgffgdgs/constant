import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation } from '../layout/Navigation';
import { Users, BarChart3, Settings, Database } from 'lucide-react';

export const AdministrationScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="p-4 pb-24">
        <h1 className="text-2xl font-bold text-white mb-6">{t('navigation.administration')}</h1>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="text-tamboura-500" size={24} />
              <h2 className="text-lg font-bold text-white">Gestion des utilisateurs</h2>
            </div>
            <p className="text-gray-400 mb-4">Créer, modifier et gérer les comptes utilisateurs</p>
            <button className="btn-primary">Gérer les utilisateurs</button>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="text-tamboura-500" size={24} />
              <h2 className="text-lg font-bold text-white">Statistiques globales</h2>
            </div>
            <p className="text-gray-400 mb-4">Voir les métriques et rapports d'activité</p>
            <button className="btn-primary">Voir les statistiques</button>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="text-tamboura-500" size={24} />
              <h2 className="text-lg font-bold text-white">Synchronisation</h2>
            </div>
            <p className="text-gray-400 mb-4">Gérer la synchronisation des données</p>
            <button className="btn-primary">Forcer la synchronisation</button>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="text-tamboura-500" size={24} />
              <h2 className="text-lg font-bold text-white">Configuration</h2>
            </div>
            <p className="text-gray-400 mb-4">Paramètres de l'application</p>
            <button className="btn-primary">Configurer</button>
          </div>
        </div>
      </main>
    </div>
  );
};