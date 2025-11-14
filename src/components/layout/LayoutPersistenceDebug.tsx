

'use client';

import React, { useState } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useLayoutPersistence } from '@/hooks/useLayoutPersistence';
import { useLayoutDebugDev } from '@/hooks/useLayoutDebug';
import { useLayoutIntegration } from '@/hooks/useLayoutData';

interface LayoutPersistenceDebugProps {
 className?: string;
 showDetails?: boolean;
 showAdvanced?: boolean;
}

export function LayoutPersistenceDebug({ 
 className = '', 
 showDetails = false,
 showAdvanced = false
}: LayoutPersistenceDebugProps) {
 const layout = useLayout();
 const persistence = useLayoutPersistence();
 const integration = useLayoutIntegration();
 const debug = useLayoutDebugDev();
 const [isExpanded, setIsExpanded] = useState(showDetails);
 const [showAdvancedPanel, setShowAdvancedPanel] = useState(showAdvanced);
 const [importFile, setImportFile] = useState<File | null>(null);

 const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (file) {
 setImportFile(file);
 const success = await persistence.importPreferences(file);
 if (success) {
 alert('Preferences imported successfully!');
 } else {
 alert('Failed to import preferences. Please check the file format.');
 }
 setImportFile(null);
 event.target.value = '';
 }
 };

 const formatBytes = (bytes: number) => {
 if (bytes === 0) return '0 B';
 const k = 1024;
 const sizes = ['B', 'KB', 'MB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 };

 const formatTime = (timestamp?: number) => {
 if (!timestamp) return 'Never';
 return new Date(timestamp).toLocaleTimeString();
 };

 if (!isExpanded) {
 return (
 <div className={`p-2 bg-gray-100 rounded text-xs ${className}`}>
 <button
 onClick={() => setIsExpanded(true)}
 className="text-blue-600 hover:text-blue-800"
 >
 Show Layout Debug Info
 </button>
 <span className="ml-2 text-gray-600">
 Storage: {persistence.isStorageAvailable ? '✓' : '✗'} | 
 Size: {formatBytes(persistence.storageInfo.totalSize)}
 </span>
 </div>
 );
 }

 return (
 <div className={`p-4 bg-gray-50 rounded-lg border text-sm ${className}`}>
 <div className="flex justify-between items-center mb-3">
 <h3 className="font-semibold text-gray-800">Layout Persistence Debug</h3>
 <button
 onClick={() => setIsExpanded(false)}
 className="text-gray-500 hover:text-gray-700"
 >
 ✕
 </button>
 </div>

 {}
 <div className="mb-4">
 <h4 className="font-medium text-gray-700 mb-2">Storage Status</h4>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div>
 <span className="text-gray-600">Available:</span>
 <span className={`ml-1 ${persistence.isStorageAvailable ? 'text-green-600' : 'text-red-600'}`}>
 {persistence.isStorageAvailable ? '✓ Yes' : '✗ No'}
 </span>
 </div>
 <div>
 <span className="text-gray-600">Last Sync:</span>
 <span className="ml-1 text-gray-800">
 {formatTime(persistence.lastSyncTime)}
 </span>
 </div>
 <div>
 <span className="text-gray-600">Preferences:</span>
 <span className="ml-1 text-gray-800">
 {formatBytes(persistence.storageInfo.preferencesSize)}
 </span>
 </div>
 <div>
 <span className="text-gray-600">Navigation:</span>
 <span className="ml-1 text-gray-800">
 {formatBytes(persistence.storageInfo.navigationSize)}
 </span>
 </div>
 </div>
 </div>

 {}
 <div className="mb-4">
 <h4 className="font-medium text-gray-700 mb-2">Current State</h4>
 <div className="bg-white p-2 rounded border text-xs">
 <div className="mb-2">
 <strong>Layout:</strong> {layout.currentLayout}
 <span className="ml-2 text-gray-600">
 (Loading: {layout.isLayoutLoading ? 'Yes' : 'No'})
 </span>
 </div>
 <div className="mb-2">
 <strong>Sidebar:</strong> {layout.navigation.sidebarOpen ? 'Open' : 'Closed'}
 <span className="ml-2 text-gray-600">
 (Collapsed: {layout.preferences.sidebarCollapsed ? 'Yes' : 'No'})
 </span>
 </div>
 <div className="mb-2">
 <strong>Theme:</strong> {layout.preferences.theme}
 <span className="ml-2 text-gray-600">
 (Compact: {layout.preferences.compactMode ? 'Yes' : 'No'})
 </span>
 </div>
 <div>
 <strong>Active Route:</strong> {layout.navigation.activeRoute || 'None'}
 </div>
 </div>
 </div>

 {}
 <div className="mb-4">
 <h4 className="font-medium text-gray-700 mb-2">Actions</h4>
 <div className="flex flex-wrap gap-2">
 <button
 onClick={persistence.clearLayoutData}
 className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
 >
 Clear All Data
 </button>
 <button
 onClick={persistence.exportPreferences}
 className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
 >
 Export Preferences
 </button>
 <label className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs cursor-pointer">
 Import Preferences
 <input
 type="file"
 accept=".json"
 onChange={handleFileImport}
 className="hidden"
 />
 </label>
 <button
 onClick={persistence.updateStorageInfo}
 className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
 >
 Refresh Info
 </button>
 </div>
 </div>

 {}
 <div className="mb-4">
 <h4 className="font-medium text-gray-700 mb-2">Test Actions</h4>
 <div className="flex flex-wrap gap-2">
 <button
 onClick={() => layout.setSidebarOpen(!layout.navigation.sidebarOpen)}
 className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
 >
 Toggle Sidebar
 </button>
 <button
 onClick={() => layout.updateLayoutPreferences({ 
 theme: layout.preferences.theme === 'light' ? 'dark' : 'light' 
 })}
 className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
 >
 Toggle Theme
 </button>
 <button
 onClick={() => layout.updateLayoutPreferences({ 
 compactMode: !layout.preferences.compactMode 
 })}
 className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
 >
 Toggle Compact
 </button>
 </div>
 </div>

 {}
 {layout.error && (
 <div className="mb-4">
 <h4 className="font-medium text-red-700 mb-2">Error</h4>
 <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-700">
 {layout.error}
 <button
 onClick={layout.clearError}
 className="ml-2 text-red-500 hover:text-red-700"
 >
 ✕
 </button>
 </div>
 </div>
 )}

 {}
 {persistence.hasCustomPreferences && (
 <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
 ⚠️ You have custom preferences that differ from defaults
 </div>
 )}

 {}
 {process.env.NODE_ENV === 'development' && (
 <div className="mt-4 border-t pt-4">
 <div className="flex justify-between items-center mb-2">
 <h4 className="font-medium text-gray-700">Advanced Debug</h4>
 <button
 onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
 className="text-xs text-blue-600 hover:text-blue-800"
 >
 {showAdvancedPanel ? 'Hide' : 'Show'} Advanced
 </button>
 </div>
 
 {showAdvancedPanel && debug.debugInfo && (
 <div className="space-y-3">
 {}
 <div className="bg-white p-2 rounded border text-xs">
 <div className="font-medium text-gray-700 mb-1">Performance</div>
 <div className="grid grid-cols-2 gap-1">
 <div>Renders: {debug.currentPerformance?.renderCount || 0}</div>
 <div>Avg Time: {(debug.currentPerformance?.averageRenderTime || 0).toFixed(2)}ms</div>
 <div>Slow Renders: {debug.currentPerformance?.slowRenders || 0}</div>
 <div className={debug.hasPerformanceIssues ? 'text-red-600' : 'text-green-600'}>
 Status: {debug.hasPerformanceIssues ? '⚠️ Issues' : '✅ Good'}
 </div>
 </div>
 </div>

 {}
 <div className="bg-white p-2 rounded border text-xs">
 <div className="font-medium text-gray-700 mb-1">Routing</div>
 <div>
 <div>Current: {debug.debugInfo.routing.currentPath}</div>
 <div>Expected: {debug.debugInfo.routing.expectedLayout}</div>
 <div>Actual: {debug.debugInfo.routing.actualLayout}</div>
 <div className={debug.hasRouteErrors ? 'text-red-600' : 'text-green-600'}>
 {debug.hasRouteErrors ? '⚠️ Layout Mismatch' : '✅ Layout Match'}
 </div>
 </div>
 </div>

 {}
 <div className="bg-white p-2 rounded border text-xs">
 <div className="font-medium text-gray-700 mb-1">Layout Data</div>
 <div>
 <div>Type: {integration.layout.currentLayout}</div>
 <div>Loading: {integration.layoutData.loading ? 'Yes' : 'No'}</div>
 <div>Error: {integration.layoutData.error || 'None'}</div>
 <div>Stale: {integration.layoutData.isStale ? 'Yes' : 'No'}</div>
 </div>
 </div>

 {}
 {debug.hasErrors && (
 <div className="bg-red-50 p-2 rounded border border-red-200 text-xs">
 <div className="font-medium text-red-700 mb-1">Recent Errors</div>
 <div className="space-y-1 max-h-20 overflow-y-auto">
 {debug.recentErrors.map(error => (
 <div key={error.id} className="text-red-600">
 [{error.type}] {error.message}
 </div>
 ))}
 </div>
 </div>
 )}

 {}
 <div className="flex flex-wrap gap-1">
 <button
 onClick={debug.actions.logCurrentState}
 className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
 >
 Log State
 </button>
 <button
 onClick={debug.actions.exportDebugData}
 className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
 >
 Export Debug
 </button>
 <button
 onClick={debug.actions.clearErrors}
 className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs"
 >
 Clear Errors
 </button>
 <button
 onClick={() => integration.layoutData.refresh()}
 className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
 >
 Refresh Data
 </button>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 );
}

export default LayoutPersistenceDebug;