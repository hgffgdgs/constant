import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '../layout/Navigation';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { OfflineStorageService } from '../../services/offlineStorage';
import { PDFService } from '../../services/pdfService';
import { Report } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Download, MapPin } from 'lucide-react';

export const ReportDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadReport(id);
    }
  }, [id]);

  const loadReport = async (reportId: string) => {
    setIsLoading(true);
    try {
      const reportData = await OfflineStorageService.getReport(reportId);
      setReport(reportData);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (report && user) {
      try {
        await PDFService.exportToPDF(report, user);
      } catch (error) {
        console.error('Error exporting PDF:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Chargement du constat..." />;
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Constat non trouvé</h2>
          <button onClick={() => navigate('/reports')} className="btn-primary">
            Retour aux constats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="p-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/reports')}
              className="p-2 text-gray-400 hover:text-white rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white">Constat #{report.id.slice(-6)}</h1>
          </div>
          <button
            onClick={handleExportPDF}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download size={16} />
            <span>PDF</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4">Informations générales</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Type d'incident:</span>
                <div className="text-white font-medium">{t(`incidentTypes.${report.incidentType}`)}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Date et heure:</span>
                <div className="text-white">{format(new Date(report.dateTime), 'dd/MM/yyyy à HH:mm', { locale: fr })}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Statut:</span>
                <div className="text-white">{t(`status.${report.status}`)}</div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4">Localisation</h2>
            <div className="flex items-start space-x-2">
              <MapPin className="text-gray-400 mt-1" size={16} />
              <div>
                <div className="text-white">{report.location.address}</div>
                {report.location.coordinates && (
                  <div className="text-gray-400 text-sm">
                    {report.location.coordinates.latitude.toFixed(6)}, {report.location.coordinates.longitude.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4">Description</h2>
            <p className="text-gray-300">{report.description}</p>
          </div>

          {/* Involved Persons */}
          {report.involvedPersons.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Personnes impliquées</h2>
              <div className="space-y-3">
                {report.involvedPersons.map((person) => (
                  <div key={person.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium">{person.name}</span>
                      <span className="px-2 py-1 bg-tamboura-500 text-gray-900 text-xs rounded">
                        {person.status}
                      </span>
                    </div>
                    {person.phone && (
                      <div className="text-gray-400 text-sm">{person.phone}</div>
                    )}
                    {person.details && (
                      <div className="text-gray-300 text-sm mt-1">{person.details}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {report.photos.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Photos</h2>
              <div className="grid grid-cols-2 gap-3">
                {report.photos.map((photo) => (
                  <div key={photo.id}>
                    <img
                      src={photo.localUrl || photo.url}
                      alt="Evidence"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {photo.caption && (
                      <p className="text-gray-400 text-xs mt-1">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures */}
          {(report.agentSignature || report.witnessSignature) && (
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Signatures</h2>
              <div className="space-y-4">
                {report.agentSignature && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Signature de l'agent</h3>
                    <img
                      src={report.agentSignature}
                      alt="Agent Signature"
                      className="bg-white rounded-lg p-2 max-w-64"
                    />
                  </div>
                )}
                {report.witnessSignature && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Signature du témoin</h3>
                    <img
                      src={report.witnessSignature}
                      alt="Witness Signature"
                      className="bg-white rounded-lg p-2 max-w-64"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};