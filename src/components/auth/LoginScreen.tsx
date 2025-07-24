import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Eye, EyeOff, Shield, Smartphone } from 'lucide-react';
import { loadDemoData } from '../../utils/demoData';

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '',
    password: ''
  });

  // Load demo data on component mount
  React.useEffect(() => {
    loadDemoData().catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.matricule && formData.password) {
      await login(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isLoading) {
    return <LoadingSpinner text="Connexion en cours..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-tamboura-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold text-tamboura-500 mb-2">
            {t('app.name')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.matricule')}
              </label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                value={formData.matricule}
                onChange={handleInputChange}
                placeholder={t('auth.enterMatricule')}
                className="input-field"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('auth.enterPassword')}
                  className="input-field pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !formData.matricule || !formData.password}
              className="btn-primary w-full text-lg py-4 touch-manipulation"
            >
              {t('auth.login')}
            </button>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Comptes de démonstration:</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div>Agent: <span className="text-white">A001</span> / <span className="text-white">demo123</span></div>
              <div>Chef: <span className="text-white">S001</span> / <span className="text-white">demo123</span></div>
              <div>Admin: <span className="text-white">ADM001</span> / <span className="text-white">demo123</span></div>
            </div>
          </div>
        </div>

        {/* Offline Mode Info */}
        {!navigator.onLine && (
          <div className="mt-4 p-4 bg-orange-600/20 border border-orange-600 rounded-lg">
            <div className="flex items-center space-x-2">
              <Smartphone size={16} className="text-orange-400" />
              <p className="text-orange-400 text-sm">
                Mode hors ligne - Utilisez vos identifiants précédemment sauvegardés
              </p>
            </div>
          </div>
        )}

        {/* Language Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              const currentLang = localStorage.getItem('i18nextLng') || 'fr';
              const newLang = currentLang === 'fr' ? 'bm' : 'fr';
              localStorage.setItem('i18nextLng', newLang);
              window.location.reload();
            }}
            className="text-gray-400 hover:text-tamboura-500 text-sm"
          >
            {localStorage.getItem('i18nextLng') === 'bm' ? 'Français' : 'Bambara'}
          </button>
        </div>
      </div>
    </div>
  );
};