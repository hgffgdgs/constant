import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation } from '../layout/Navigation';
import { IncidentType, Report, InvolvedPerson, Photo } from '../../types';
import { OfflineStorageService } from '../../services/offlineStorage';
import { PDFService } from '../../services/pdfService';
import { v4 as uuidv4 } from 'uuid';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Camera,
  MapPin,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';

export const NewReportScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const agentSigRef = useRef<SignatureCanvas>(null);
  const witnessSigRef = useRef<SignatureCanvas>(null);

  const [formData, setFormData] = useState({
    incidentType: 'accident' as IncidentType,
    dateTime: new Date().toISOString().slice(0, 16),
    location: {
      address: '',
      coordinates: undefined as { latitude: number; longitude: number } | undefined
    },
    description: '',
    involvedPersons: [] as InvolvedPerson[],
    photos: [] as Photo[],
    audioNotes: [],
    agentSignature: '',
    witnessSignature: ''
  });

  const [newPerson, setNewPerson] = useState({
    name: '',
    phone: '',
    status: 'witness' as 'victim' | 'witness' | 'suspect' | 'other',
    details: ''
  });

  const incidentTypes: IncidentType[] = [
    'accident', 'theft', 'assault', 'vandalism', 
    'disturbance', 'fire', 'medical', 'other'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationUpdate = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }
        }));
      });
    }
  };

  const addInvolvedPerson = () => {
    if (newPerson.name.trim()) {
      const person: InvolvedPerson = {
        id: uuidv4(),
        ...newPerson
      };
      setFormData(prev => ({
        ...prev,
        involvedPersons: [...prev.involvedPersons, person]
      }));
      setNewPerson({
        name: '',
        phone: '',
        status: 'witness',
        details: ''
      });
    }
  };

  const removeInvolvedPerson = (id: string) => {
    setFormData(prev => ({
      ...prev,
      involvedPersons: prev.involvedPersons.filter(p => p.id !== id)
    }));
  };

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const photoId = uuidv4();
        const photo: Photo = {
          id: photoId,
          url: URL.createObjectURL(file),
          localUrl: URL.createObjectURL(file),
          timestamp: new Date().toISOString()
        };
        
        // Save photo to offline storage
        await OfflineStorageService.savePhoto(photo, file);
        
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, photo]
        }));
      }
    }
  };

  const removePhoto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id)
    }));
  };

  const saveSignatures = () => {
    if (agentSigRef.current) {
      const agentSig = agentSigRef.current.toDataURL();
      handleInputChange('agentSignature', agentSig);
    }
    if (witnessSigRef.current) {
      const witnessSig = witnessSigRef.current.toDataURL();
      handleInputChange('witnessSignature', witnessSig);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      saveSignatures();
      
      const report: Report = {
        id: uuidv4(),
        incidentType: formData.incidentType,
        dateTime: formData.dateTime,
        location: formData.location,
        description: formData.description,
        involvedPersons: formData.involvedPersons,
        photos: formData.photos,
        audioNotes: formData.audioNotes,
        agentSignature: formData.agentSignature,
        witnessSignature: formData.witnessSignature,
        status: 'completed',
        agentId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSynced: false
      };

      // Save report offline
      await OfflineStorageService.saveReport(report);
      
      // Add to sync queue if online
      if (navigator.onLine) {
        await OfflineStorageService.addToSyncQueue({
          type: 'report',
          data: report,
          timestamp: new Date().toISOString()
        });
      }

      // Generate PDF
      try {
        await PDFService.exportToPDF(report, user);
      } catch (error) {
        console.error('PDF generation error:', error);
      }

      navigate('/reports');
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.incidentType && 
           formData.description.trim() && 
           formData.location.address.trim() &&
           formData.agentSignature;
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Informations de base</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('report.incidentType')}
              </label>
              <select
                value={formData.incidentType}
                onChange={(e) => handleInputChange('incidentType', e.target.value)}
                className="select-field"
              >
                {incidentTypes.map(type => (
                  <option key={type} value={type}>
                    {t(`incidentTypes.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('report.dateTime')}
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => handleInputChange('dateTime', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('report.location')}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleLocationUpdate('address', e.target.value)}
                  placeholder="Adresse complète du lieu"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-secondary p-3"
                >
                  <MapPin size={20} />
                </button>
              </div>
              {formData.location.coordinates && (
                <p className="text-xs text-gray-400 mt-1">
                  Coordonnées: {formData.location.coordinates.latitude.toFixed(6)}, {formData.location.coordinates.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('report.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée de l'incident..."
                rows={4}
                className="input-field resize-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Personnes impliquées</h2>
            
            <div className="card bg-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">Ajouter une personne</h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom complet"
                  className="input-field"
                />
                
                <input
                  type="tel"
                  value={newPerson.phone}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Numéro de téléphone"
                  className="input-field"
                />
                
                <select
                  value={newPerson.status}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, status: e.target.value as any }))}
                  className="select-field"
                >
                  <option value="victim">Victime</option>
                  <option value="witness">Témoin</option>
                  <option value="suspect">Suspect</option>
                  <option value="other">Autre</option>
                </select>
                
                <textarea
                  value={newPerson.details}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Détails supplémentaires..."
                  rows={2}
                  className="input-field resize-none"
                />
                
                <button
                  type="button"
                  onClick={addInvolvedPerson}
                  disabled={!newPerson.name.trim()}
                  className="btn-primary w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Ajouter la personne
                </button>
              </div>
            </div>

            {formData.involvedPersons.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">Personnes ajoutées</h3>
                {formData.involvedPersons.map((person) => (
                  <div key={person.id} className="card bg-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white">{person.name}</span>
                          <span className="px-2 py-1 bg-tamboura-500 text-gray-900 text-xs rounded">
                            {person.status}
                          </span>
                        </div>
                        {person.phone && (
                          <p className="text-gray-400 text-sm">{person.phone}</p>
                        )}
                        {person.details && (
                          <p className="text-gray-300 text-sm mt-1">{person.details}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeInvolvedPerson(person.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Photos et médias</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('report.photos')}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
                id="photo-input"
              />
              <label
                htmlFor="photo-input"
                className="btn-secondary w-full flex items-center justify-center py-4 cursor-pointer"
              >
                <Camera size={20} className="mr-2" />
                Prendre des photos
              </label>
            </div>

            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {formData.photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.localUrl || photo.url}
                      alt="Evidence"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Signatures</h2>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Signature de l'agent</h3>
              <div className="bg-white rounded-lg p-2">
                <SignatureCanvas
                  ref={agentSigRef}
                  canvasProps={{
                    width: 300,
                    height: 150,
                    className: 'signature-canvas w-full'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => agentSigRef.current?.clear()}
                className="btn-secondary text-sm mt-2"
              >
                Effacer
              </button>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">Signature du témoin (optionnel)</h3>
              <div className="bg-white rounded-lg p-2">
                <SignatureCanvas
                  ref={witnessSigRef}
                  canvasProps={{
                    width: 300,
                    height: 150,
                    className: 'signature-canvas w-full'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => witnessSigRef.current?.clear()}
                className="btn-secondary text-sm mt-2"
              >
                Effacer
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="p-4 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{t('report.newReport')}</h1>
          <div className="text-sm text-gray-400">
            Étape {currentStep} / 4
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  step <= currentStep ? 'bg-tamboura-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="fixed bottom-20 left-4 right-4 flex space-x-3">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="btn-secondary flex-1"
            >
              Précédent
            </button>
          )}
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="btn-primary flex-1"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent mr-2" />
              ) : (
                <CheckCircle size={20} className="mr-2" />
              )}
              {isSubmitting ? 'Enregistrement...' : 'Finaliser'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};