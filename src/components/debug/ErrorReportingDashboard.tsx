'use client'

import React, { useState, useEffect } from 'react'
import { errorReportingService, type ErrorReport } from '@/lib/services/errorReportingService'

export function ErrorReportingDashboard() {
 const [reports, setReports] = useState<ErrorReport[]>([])
 const [storedReports, setStoredReports] = useState<ErrorReport[]>([])
 const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null)
 const [filter, setFilter] = useState<'all' | 'high' | 'critical'>('all')
 const [isVisible, setIsVisible] = useState(false)

 useEffect(() => {
 if (process.env.NODE_ENV === 'development') {
 loadReports()
 const interval = setInterval(loadReports, 5000) // Refresh every 5 seconds
 return () => clearInterval(interval)
 }
 }, [])

 const loadReports = () => {
 const currentReports = errorReportingService.getReports()
 const stored = errorReportingService.getStoredReports()
 setReports(currentReports)
 setStoredReports(stored)
 }

 const clearAllReports = () => {
 errorReportingService.clearReports()
 setReports([])
 setStoredReports([])
 setSelectedReport(null)
 }

 const filteredReports = [...reports, ...storedReports].filter(report => {
 if (filter === 'all') return true
 return report.severity === filter
 })

 const getSeverityColor = (severity: ErrorReport['severity']) => {
 switch (severity) {
 case 'critical': return 'text-red-600 bg-red-100'
 case 'high': return 'text-orange-600 bg-orange-100'
 case 'medium': return 'text-yellow-600 bg-yellow-100'
 case 'low': return 'text-blue-600 bg-blue-100'
 default: return 'text-gray-600 bg-gray-100'
 }
 }

 const formatError = (error: Error | string) => {
 if (error instanceof Error) {
 return {
 message: error.message,
 stack: error.stack,
 name: error.name
 }
 }
 return { message: String(error) }
 }

 if (process.env.NODE_ENV !== 'development') {
 return null
 }

 return (
 <>
 {}
 <button
 onClick={() => setIsVisible(!isVisible)}
 className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
 title="Error Reports Dashboard"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
 </svg>
 {filteredReports.length > 0 && (
 <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
 {filteredReports.length}
 </span>
 )}
 </button>

 {}
 {isVisible && (
 <div className="fixed inset-0 z-50 overflow-hidden">
 <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsVisible(false)} />
 <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
 <div className="flex flex-col h-full">
 {}
 <div className="flex items-center justify-between p-4 border-b">
 <div className="flex items-center space-x-4">
 <h2 className="text-lg font-semibold">Error Reports Dashboard</h2>
 <span className="text-sm text-gray-500">
 ({filteredReports.length} reports)
 </span>
 </div>
 <div className="flex items-center space-x-2">
 <select
 value={filter}
 onChange={(e) => setFilter(e.target.value as any)}
 className="text-sm border rounded px-2 py-1"
 >
 <option value="all">All Severity</option>
 <option value="critical">Critical</option>
 <option value="high">High</option>
 <option value="medium">Medium</option>
 <option value="low">Low</option>
 </select>
 <button
 onClick={clearAllReports}
 className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
 >
 Clear All
 </button>
 <button
 onClick={() => setIsVisible(false)}
 className="text-gray-500 hover:text-gray-700"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 </div>

 <div className="flex flex-1 overflow-hidden">
 {}
 <div className="w-1/2 border-r overflow-y-auto">
 {filteredReports.length === 0 ? (
 <div className="p-8 text-center text-gray-500">
 <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p>No error reports found</p>
 <p className="text-sm mt-1">Errors will appear here when they occur</p>
 </div>
 ) : (
 <div className="divide-y">
 {filteredReports.map((report) => {
 const errorInfo = formatError(report.error)
 return (
 <div
 key={report.id}
 onClick={() => setSelectedReport(report)}
 className={`p-4 cursor-pointer hover:bg-gray-50 ${
 selectedReport?.id === report.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
 }`}
 >
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-2 mb-1">
 <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(report.severity)}`}>
 {report.severity.toUpperCase()}
 </span>
 {report.tags?.map(tag => (
 <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
 {tag}
 </span>
 ))}
 </div>
 <p className="text-sm font-medium text-gray-900 truncate">
 {errorInfo.message}
 </p>
 <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
 <span>{report.timestamp.toLocaleTimeString()}</span>
 {report.context.component && (
 <span>Component: {report.context.component}</span>
 )}
 {report.context.page && (
 <span>Page: {report.context.page}</span>
 )}
 </div>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>

 {}
 <div className="w-1/2 overflow-y-auto">
 {selectedReport ? (
 <div className="p-4">
 <div className="mb-4">
 <div className="flex items-center space-x-2 mb-2">
 <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(selectedReport.severity)}`}>
 {selectedReport.severity.toUpperCase()}
 </span>
 <span className="text-sm text-gray-500">
 {selectedReport.timestamp.toLocaleString()}
 </span>
 </div>
 <h3 className="text-lg font-semibold text-gray-900">
 {formatError(selectedReport.error).message}
 </h3>
 </div>

 {}
 <div className="mb-4">
 <h4 className="text-sm font-medium text-gray-700 mb-2">Context</h4>
 <div className="bg-gray-50 rounded p-3 text-sm">
 <div className="grid grid-cols-2 gap-2">
 {Object.entries(selectedReport.context).map(([key, value]) => (
 value && (
 <div key={key}>
 <span className="font-medium text-gray-600">{key}:</span>
 <span className="ml-1 text-gray-800">{String(value)}</span>
 </div>
 )
 ))}
 </div>
 </div>
 </div>

 {}
 {selectedReport.tags && selectedReport.tags.length > 0 && (
 <div className="mb-4">
 <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
 <div className="flex flex-wrap gap-1">
 {selectedReport.tags.map(tag => (
 <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
 {tag}
 </span>
 ))}
 </div>
 </div>
 )}

 {}
 {Object.keys(selectedReport.metadata || {}).length > 0 && (
 <div className="mb-4">
 <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata</h4>
 <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto">
 {JSON.stringify(selectedReport.metadata, null, 2)}
 </pre>
 </div>
 )}

 {}
 {formatError(selectedReport.error).stack && (
 <div className="mb-4">
 <h4 className="text-sm font-medium text-gray-700 mb-2">Stack Trace</h4>
 <pre className="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-auto max-h-64">
 {formatError(selectedReport.error).stack}
 </pre>
 </div>
 )}

 {}
 {selectedReport.errorInfo && (
 <div className="mb-4">
 <h4 className="text-sm font-medium text-gray-700 mb-2">Error Info</h4>
 <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto">
 {JSON.stringify(selectedReport.errorInfo, null, 2)}
 </pre>
 </div>
 )}
 </div>
 ) : (
 <div className="p-8 text-center text-gray-500">
 <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p>Select an error report to view details</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </>
 )
}