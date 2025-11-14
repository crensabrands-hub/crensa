

import { useCallback, useEffect, useState } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { layoutPersistence, LayoutSyncEvent } from '@/lib/layout-persistence';

export interface LayoutPersistenceInfo {
 storageAvailable: boolean;
 preferencesSize: number;
 navigationSize: number;
 totalSize: number;
 lastSyncTime?: number;
}

export function useLayoutPersistence() {
 const layout = useLayout();
 const [syncInfo, setSyncInfo] = useState<LayoutPersistenceInfo>({
 storageAvailable: false,
 preferencesSize: 0,
 navigationSize: 0,
 totalSize: 0,
 });
 const [lastSyncTime, setLastSyncTime] = useState<number>();

 const updateStorageInfo = useCallback(() => {
 const info = layout.getStorageInfo();
 setSyncInfo({
 storageAvailable: info.available,
 preferencesSize: info.preferences,
 navigationSize: info.navigation,
 totalSize: info.preferences + info.navigation,
 lastSyncTime,
 });
 }, [layout, lastSyncTime]);

 const clearLayoutData = useCallback(() => {
 layout.resetLayoutState();
 updateStorageInfo();
 }, [layout, updateStorageInfo]);

 const exportPreferences = useCallback(() => {
 try {
 const preferences = layout.preferences;
 const data = JSON.stringify(preferences, null, 2);
 const blob = new Blob([data], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 
 const link = document.createElement('a');
 link.href = url;
 link.download = 'crensa-layout-preferences.json';
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 
 return true;
 } catch (error) {
 console.error('Failed to export preferences:', error);
 return false;
 }
 }, [layout.preferences]);

 const importPreferences = useCallback((file: File): Promise<boolean> => {
 return new Promise((resolve) => {
 const reader = new FileReader();
 
 reader.onload = (event) => {
 try {
 const data = JSON.parse(event.target?.result as string);

 if (data && typeof data === 'object') {
 layout.updateLayoutPreferences(data);
 updateStorageInfo();
 resolve(true);
 } else {
 console.error('Invalid preferences file format');
 resolve(false);
 }
 } catch (error) {
 console.error('Failed to import preferences:', error);
 resolve(false);
 }
 };
 
 reader.onerror = () => {
 console.error('Failed to read preferences file');
 resolve(false);
 };
 
 reader.readAsText(file);
 });
 }, [layout, updateStorageInfo]);

 const hasCustomPreferences = useCallback(() => {
 const current = layout.preferences;
 const defaults = layoutPersistence.loadPreferences();
 
 return JSON.stringify(current) !== JSON.stringify(defaults);
 }, [layout.preferences]);

 useEffect(() => {
 const handleSyncEvent = (event: LayoutSyncEvent) => {
 setLastSyncTime(event.timestamp);
 updateStorageInfo();
 };

 const unsubscribe = layoutPersistence.addSyncListener(handleSyncEvent);
 return unsubscribe;
 }, [updateStorageInfo]);

 useEffect(() => {
 updateStorageInfo();
 }, [updateStorageInfo]);

 useEffect(() => {
 const checkStorage = () => {
 updateStorageInfo();
 };

 checkStorage();
 const interval = setInterval(checkStorage, 10000);
 
 return () => clearInterval(interval);
 }, [updateStorageInfo]);

 return {

 storageInfo: syncInfo,

 clearLayoutData,
 exportPreferences,
 importPreferences,
 updateStorageInfo,

 hasCustomPreferences: hasCustomPreferences(),
 isStorageAvailable: syncInfo.storageAvailable,
 lastSyncTime,
 };
}

export default useLayoutPersistence;