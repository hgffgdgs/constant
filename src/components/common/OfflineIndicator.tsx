import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 z-50 safe-area-top">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff size={16} />
        <span className="text-sm font-medium">{t('common.offline')}</span>
      </div>
    </div>
  );
};