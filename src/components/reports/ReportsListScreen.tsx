import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation } from '../layout/Navigation';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { OfflineStorageService } from '../../services/offlineStorage';
import { Report } from '../../types';
import { format } from 'date-fns';
import { 
  Search,

  FileText,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  Download
} from 'lucide-react';

export const ReportsListScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [reports, searchQuery, selectedStatus, selectedType]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const allReports = await OfflineStorageService.getAllReports();
      
      // Filter reports based on user role
      let userReports = allReports;
      if (user?.role === 'agent') {
        userReports = allReports.filter(report => report.agentId === user.id);
      }
      // For supervisors and admins, show all reports for demo purposes
      
      setReports(userReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = reports;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(report =>
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.incidentType === selectedType);
    }

    setFilteredReports(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-400 bg-yellow-400/10';
      case 'pending': return 'text-orange-400 bg-orange-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'signed': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'signed': return <CheckCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const handleReportClick = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  if (isLoading) {
    return <LoadingSpinner text="Chargement des constats..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="p-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{t('navigation.reports')}</h1>
          <div className="text-sm text-gray-400">
            {filteredReports.length} constat{filteredReports.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un constat..."
              className="input-field pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select-field"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">{t('status.draft')}</option>
              <option value="pending">{t('status.pending')}</option>
              <option value="completed">{t('status.completed')}</option>
              <option value="signed">{t('status.signed')}</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select-field"
            >
              <option value="all">Tous les types</option>
              <option value="accident">{t('incidentTypes.accident')}</option>
              <option value="theft">{t('incidentTypes.theft')}</option>
              <option value="assault">{t('incidentTypes.assault')}</option>
              <option value="vandalism">{t('incidentTypes.vandalism')}</option>
              <option value="disturbance">{t('incidentTypes.disturbance')}</option>
              <option value="fire">{t('incidentTypes.fire')}</option>
              <option value="medical">{t('incidentTypes.medical')}</option>
              <option value="other">{t('incidentTypes.other')}</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => handleReportClick(report.id)}
                className="card cursor-pointer hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {t(`incidentTypes.${report.incidentType}`)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span>{t(`status.${report.status}`)}</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    #{report.id.slice(-6)}
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {report.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span className="truncate max-w-32">
                      {report.location.address}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>
                      {format(new Date(report.dateTime), 'dd/MM/yy HH:mm')}
                    </span>
                  </div>
                </div>

                {/* Additional info */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {report.photos.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <FileText size={12} />
                        <span>{report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {report.involvedPersons.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <FileText size={12} />
                        <span>{report.involvedPersons.length} personne{report.involvedPersons.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!report.isSynced && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full" title="En attente de synchronisation" />
                    )}
                    {report.pdfUrl && (
                      <Download size={12} className="text-green-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FileText className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || selectedStatus !== 'all' || selectedType !== 'all' 
                ? 'Aucun constat trouvé' 
                : 'Aucun constat'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedStatus !== 'all' || selectedType !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par créer votre premier constat d\'intervention'}
            </p>
            {(!searchQuery && selectedStatus === 'all' && selectedType === 'all') && (
              <button
                onClick={() => navigate('/new-report')}
                className="btn-primary"
              >
                Créer un constat
              </button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {reports.length > 0 && (
          <div className="mt-8 card bg-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Résumé</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-tamboura-500">
                  {reports.filter(r => r.status === 'completed' || r.status === 'signed').length}
                </div>
                <div className="text-gray-400 text-sm">Terminés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {reports.filter(r => r.status === 'pending' || r.status === 'draft').length}
                </div>
                <div className="text-gray-400 text-sm">En cours</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};