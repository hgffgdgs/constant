import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation } from '../layout/Navigation';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { OfflineStorageService } from '../../services/offlineStorage';
import { Report, DashboardStats } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,

  MapPin,
  Calendar
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load reports from offline storage
        const allReports = await OfflineStorageService.getAllReports();
        
        // Filter reports based on user role
        let userReports = allReports;
        if (user?.role === 'agent') {
          userReports = allReports.filter(report => report.agentId === user.id);
        } else if (user?.role === 'supervisor') {
          userReports = allReports.filter(report => 
            // In a real app, you would filter by zone/unit
            report.agentId === user.id || true // Show all for demo
          );
        }

        // Calculate stats
        const totalReports = userReports.length;
        const pendingReports = userReports.filter(r => r.status === 'pending' || r.status === 'draft').length;
        const completedReports = userReports.filter(r => r.status === 'completed' || r.status === 'signed').length;

        setStats({
          totalReports,
          pendingReports,
          completedReports,
          recentActivity: [] // Would be populated from real data
        });

        // Get recent reports (last 5)
        setRecentReports(userReports.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-400 bg-yellow-400/10';
      case 'pending': return 'text-orange-400 bg-orange-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'signed': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getIncidentTypeIcon = () => {
    // Return appropriate icon based on incident type
    return <AlertCircle size={16} />;
  };

  if (isLoading) {
    return <LoadingSpinner text="Chargement du tableau de bord..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="p-4 pb-24">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('dashboard.welcome')}{user?.firstName ? `, ${user.firstName}` : ''}
          </h2>
          <p className="text-gray-400">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{t('dashboard.totalReports')}</p>
                  <p className="text-2xl font-bold text-white">{stats.totalReports}</p>
                </div>
                <FileText className="text-tamboura-500" size={24} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{t('dashboard.pendingReports')}</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.pendingReports}</p>
                </div>
                <Clock className="text-orange-400" size={24} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{t('dashboard.completedReports')}</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completedReports}</p>
                </div>
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Cette semaine</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {recentReports.filter(r => {
                      const reportDate = new Date(r.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return reportDate > weekAgo;
                    }).length}
                  </p>
                </div>
                <TrendingUp className="text-blue-400" size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = '/new-report'}
              className="btn-primary flex items-center justify-center space-x-2 py-4"
            >
              <FileText size={20} />
              <span>Nouveau constat</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/reports'}
              className="btn-secondary flex items-center justify-center space-x-2 py-4"
            >
              <Calendar size={20} />
              <span>Mes constats</span>
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">{t('dashboard.recentReports')}</h3>
            <button 
              onClick={() => window.location.href = '/reports'}
              className="text-tamboura-500 text-sm"
            >
              {t('dashboard.viewAll')}
            </button>
          </div>

          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getIncidentTypeIcon()}
                        <span className="text-white font-medium">
                          {t(`incidentTypes.${report.incidentType}`)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                          {t(`status.${report.status}`)}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {report.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin size={12} />
                          <span>{report.location.address.substring(0, 30)}...</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{format(new Date(report.dateTime), 'dd/MM HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <FileText className="mx-auto text-gray-600 mb-3" size={48} />
              <p className="text-gray-400">{t('dashboard.noReports')}</p>
            </div>
          )}
        </div>

        {/* Zone-specific info for supervisors/admins */}
        {user?.role !== 'agent' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-3">Statistiques de zone</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-tamboura-500">
                  {user?.zone || 'Bamako'}
                </div>
                <div className="text-gray-400 text-sm">Zone assignée</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {user?.unit || 'Unité 1'}
                </div>
                <div className="text-gray-400 text-sm">Unité</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};