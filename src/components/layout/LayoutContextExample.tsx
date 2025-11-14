

'use client';

import React from 'react';
import { useLayoutContext, useSimpleLayout, useLayoutData } from '@/hooks/useLayoutContext';

interface LayoutContextExampleProps {
 showAdvanced?: boolean;
}

export function LayoutContextExample({ showAdvanced = false }: LayoutContextExampleProps) {

 const simpleLayout = useSimpleLayout();

 const layoutData = useLayoutData();

 const fullContext = useLayoutContext();

 if (process.env.NODE_ENV !== 'development') {
 return null; // Only show in development
 }

 return (
 <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
 <h3 className="font-semibold text-gray-800">Layout Context Integration Examples</h3>
 
 {}
 <div className="bg-white p-3 rounded border">
 <h4 className="font-medium text-gray-700 mb-2">Simple Layout Hook</h4>
 <div className="text-sm space-y-1">
 <div>Current Layout: <span className="font-mono">{simpleLayout.currentLayout}</span></div>
 <div>Loading: <span className="font-mono">{simpleLayout.isLoading ? 'true' : 'false'}</span></div>
 <div>Sidebar Open: <span className="font-mono">{simpleLayout.sidebarOpen ? 'true' : 'false'}</span></div>
 <div>Theme: <span className="font-mono">{simpleLayout.theme}</span></div>
 <div className="flex gap-2 mt-2">
 <button
 onClick={simpleLayout.toggleSidebar}
 className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
 >
 Toggle Sidebar
 </button>
 <button
 onClick={simpleLayout.toggleTheme}
 className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
 >
 Toggle Theme
 </button>
 </div>
 </div>
 </div>

 {}
 <div className="bg-white p-3 rounded border">
 <h4 className="font-medium text-gray-700 mb-2">Layout Data Hook</h4>
 <div className="text-sm space-y-1">
 <div>Layout Type: <span className="font-mono">{layoutData.layoutType}</span></div>
 <div>Has Data: <span className="font-mono">{layoutData.hasData ? 'true' : 'false'}</span></div>
 <div>Is Loading: <span className="font-mono">{layoutData.isLoading ? 'true' : 'false'}</span></div>
 <div>Is Stale: <span className="font-mono">{layoutData.isStale ? 'true' : 'false'}</span></div>
 {layoutData.error && (
 <div className="text-red-600">Error: {layoutData.error}</div>
 )}
 <div className="mt-2">
 <button
 onClick={layoutData.refresh}
 className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
 >
 Refresh Data
 </button>
 </div>
 </div>
 </div>

 {}
 {showAdvanced && (
 <div className="bg-white p-3 rounded border">
 <h4 className="font-medium text-gray-700 mb-2">Full Context Hook</h4>
 <div className="text-sm space-y-2">
 
 {}
 <div>
 <div className="font-medium text-gray-600">Layout State:</div>
 <div className="ml-2 space-y-1">
 <div>Type: {fullContext.layout.isCreator ? 'Creator' : fullContext.layout.isMember ? 'Member' : 'Public'}</div>
 <div>Loading: {fullContext.layout.isAnyLoading ? 'Yes' : 'No'}</div>
 <div>Errors: {fullContext.layout.hasAnyError ? 'Yes' : 'No'}</div>
 </div>
 </div>

 {}
 <div>
 <div className="font-medium text-gray-600">Navigation:</div>
 <div className="ml-2 space-y-1">
 <div>Active Route: <span className="font-mono">{fullContext.navigation.activeRoute}</span></div>
 <div>Breadcrumbs: {fullContext.navigation.breadcrumbs.length} items</div>
 <div>Available Routes: {fullContext.navigation.availableRoutes.length} routes</div>
 </div>
 </div>

 {}
 <div>
 <div className="font-medium text-gray-600">Preferences:</div>
 <div className="ml-2 space-y-1">
 <div>Theme: {fullContext.preferences.preferences.theme}</div>
 <div>Compact Mode: {fullContext.preferences.preferences.compactMode ? 'Yes' : 'No'}</div>
 <div>Sidebar Collapsed: {fullContext.preferences.preferences.sidebarCollapsed ? 'Yes' : 'No'}</div>
 <div>Custom Prefs: {fullContext.preferences.hasCustomPreferences ? 'Yes' : 'No'}</div>
 </div>
 </div>

 {}
 <div>
 <div className="font-medium text-gray-600">Persistence:</div>
 <div className="ml-2 space-y-1">
 <div>Storage Available: {fullContext.persistence.isStorageAvailable ? 'Yes' : 'No'}</div>
 <div>Total Size: {fullContext.persistence.storageInfo.totalSize} bytes</div>
 </div>
 </div>

 {}
 {fullContext.debug.isDebugMode && (
 <div>
 <div className="font-medium text-gray-600">Debug Info:</div>
 <div className="ml-2 space-y-1">
 <div>Has Issues: {fullContext.debug.hasIssues ? 'Yes' : 'No'}</div>
 {fullContext.debug.hasIssues && fullContext.debug.issues && (
 <div className="text-red-600 text-xs">
 Issues: {Object.entries(fullContext.debug.issues).filter(([, value]) => value).map(([key]) => key).join(', ')}
 </div>
 )}
 </div>
 </div>
 )}

 {}
 <div>
 <div className="font-medium text-gray-600">Health Status:</div>
 <div className="ml-2">
 {(() => {
 const health = fullContext.utils.getHealthStatus();
 return (
 <div className={`text-xs px-2 py-1 rounded ${health.overall ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
 {health.overall ? '✅ All Systems Healthy' : '⚠️ Issues Detected'}
 </div>
 );
 })()}
 </div>
 </div>

 {}
 <div className="flex flex-wrap gap-2 mt-3">
 <button
 onClick={fullContext.preferences.resetToDefaults}
 className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
 >
 Reset Preferences
 </button>
 <button
 onClick={fullContext.data.refreshData}
 className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
 >
 Refresh Data
 </button>
 <button
 onClick={fullContext.utils.clearAllErrors}
 className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
 >
 Clear Errors
 </button>
 {fullContext.debug.isDebugMode && fullContext.debug.debugActions && 'logCurrentState' in fullContext.debug.debugActions && (
 <button
 onClick={(fullContext.debug.debugActions as any).logCurrentState}
 className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
 >
 Log State
 </button>
 )}
 </div>
 </div>
 </div>
 )}

 {}
 <div className="bg-blue-50 p-3 rounded border border-blue-200">
 <h4 className="font-medium text-blue-800 mb-2">Usage Examples</h4>
 <div className="text-sm text-blue-700 space-y-1">
 <div><code>useSimpleLayout()</code> - For basic layout state and actions</div>
 <div><code>useLayoutData()</code> - For layout-specific data management</div>
 <div><code>useLayoutContext()</code> - For full layout functionality</div>
 <div><code>useLayoutDebugging()</code> - For debugging (dev only)</div>
 </div>
 </div>
 </div>
 );
}

export default LayoutContextExample;