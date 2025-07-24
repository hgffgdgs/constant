import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { OfflineStorageService } from '../../services/offlineStorage';

export const SyncIndicator: React.FC = () => {
  const { t } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkPendingSync = async () => {
      const queue = await OfflineStorageService.getSyncQueue();
      setPendingCount(queue.length);
    };

    checkPendingSync();
    
    // Check every 30 seconds
    const interval = setInterval(checkPendingSync, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      if (navigator.onLine && pendingCount > 0) {
        setIsSyncing(true);
        // Simulate sync process
        setTimeout(() => {
          setIsSyncing(false);
          setPendingCount(0);
        }, 3000);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingCount]);

  if (!isSyncing && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-12 left-0 right-0 bg-tamboura-600 text-gray-900 px-4 py-2 z-40">
      <div className="flex items-center justify-center space-x-2">
        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
        <span className="text-sm font-medium">
          {isSyncing 
            ? t('common.syncInProgress') 
            : t('common.sync') + ` (${pendingCount})`
          }
        </span>
      </div>
    </div>
  );
};