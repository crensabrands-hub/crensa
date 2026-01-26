'use client'

import { useState, useEffect, useCallback } from 'react'
import CoinBalance from './CoinBalance'
import { coinsToRupees } from '@/lib/utils/coin-utils'

type TransactionType = 'purchase' | 'spend' | 'earn' | 'refund' | 'withdraw'
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

interface CoinTransaction {
    id: string
    transactionType: TransactionType
    coinAmount: number
    rupeeAmount: number | null
    relatedContentType: 'video' | 'series' | null
    relatedContentId: string | null
    paymentId: string | null
    status: TransactionStatus
    description: string
    createdAt: string
}

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
}

interface CoinTransactionHistoryProps {
    className?: string
    limit?: number
}

export function CoinTransactionHistory({
    className = '',
    limit = 20
}: CoinTransactionHistoryProps) {
    const [transactions, setTransactions] = useState<CoinTransaction[]>([])
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<TransactionType | 'all'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [exporting, setExporting] = useState(false)

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
            })

            if (filterType !== 'all') {
                params.append('type', filterType)
            }

            const response = await fetch(`/api/coins/transactions?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch transactions')
            }

            const data = await response.json()
            setTransactions(data.transactions)
            setPagination(data.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [currentPage, limit, filterType])

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    const handleExport = async () => {
        try {
            setExporting(true)

            const params = new URLSearchParams({
                limit: '10000', // Large number to get all
            })

            if (filterType !== 'all') {
                params.append('type', filterType)
            }

            const response = await fetch(`/api/coins/transactions?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch transactions for export')
            }

            const data = await response.json()
            const allTransactions = data.transactions

            const csv = convertToCSV(allTransactions)

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `coin-transactions-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed:', err)
            alert('Failed to export transactions')
        } finally {
            setExporting(false)
        }
    }

    const convertToCSV = (data: CoinTransaction[]): string => {
        const headers = ['Date', 'Type', 'Coins', 'Rupees', 'Status', 'Description']
        const rows = data.map(tx => [
            new Date(tx.createdAt).toLocaleString(),
            tx.transactionType,
            tx.coinAmount.toString(),
            tx.rupeeAmount ? tx.rupeeAmount.toFixed(2) : coinsToRupees(tx.coinAmount).toFixed(2),
            tx.status,
            tx.description.replace(/,/g, ';') // Escape commas
        ])

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')
    }

    const getTransactionIcon = (type: TransactionType) => {
        switch (type) {
            case 'purchase':
                return '💰'
            case 'spend':
                return '🛒'
            case 'earn':
                return '✨'
            case 'refund':
                return '↩️'
            case 'withdraw':
                return '💸'
            default:
                return '📝'
        }
    }

    const getTransactionColor = (type: TransactionType) => {
        switch (type) {
            case 'purchase':
                return 'text-green-600'
            case 'spend':
                return 'text-red-600'
            case 'earn':
                return 'text-green-600'
            case 'refund':
                return 'text-blue-600'
            case 'withdraw':
                return 'text-orange-600'
            default:
                return 'text-gray-600'
        }
    }

    const getStatusBadge = (status: TransactionStatus) => {
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'

        switch (status) {
            case 'completed':
                return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>
            case 'pending':
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>
            case 'failed':
                return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed</span>
            case 'refunded':
                return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Refunded</span>
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>
        }
    }

    if (loading && transactions.length === 0) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                <div className="text-center text-red-600">
                    <p className="font-medium">Error loading transactions</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button
                        onClick={fetchTransactions}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`bg-white rounded-lg shadow ${className}`}>
            { }
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                    <button
                        onClick={handleExport}
                        disabled={exporting || transactions.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Exporting...
                            </>
                        ) : (
                            <>
                                📥 Export CSV
                            </>
                        )}
                    </button>
                </div>

                { }
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => {
                            setFilterType('all')
                            setCurrentPage(1)
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {(['purchase', 'spend', 'earn', 'refund', 'withdraw'] as TransactionType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setFilterType(type)
                                setCurrentPage(1)
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${filterType === type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {getTransactionIcon(type)} {type}
                        </button>
                    ))}
                </div>
            </div>

            { }
            <div className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p className="text-lg font-medium">No transactions found</p>
                        <p className="text-sm mt-1">
                            {filterType !== 'all'
                                ? `No ${filterType} transactions yet`
                                : 'Your transaction history will appear here'}
                        </p>
                    </div>
                ) : (
                    transactions.map(transaction => (
                        <div
                            key={transaction.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="text-2xl mt-1">
                                        {getTransactionIcon(transaction.transactionType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900 capitalize">
                                                {transaction.transactionType}
                                            </h3>
                                            {getStatusBadge(transaction.status)}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {transaction.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <div className={`font-bold text-lg ${getTransactionColor(transaction.transactionType)}`}>
                                        {transaction.transactionType === 'spend' || transaction.transactionType === 'withdraw' ? '-' : '+'}
                                        <CoinBalance
                                            balance={transaction.coinAmount}
                                            size="small"
                                            showRupeeEquivalent={false}
                                        />
                                    </div>
                                    {(transaction.transactionType === 'purchase' || transaction.transactionType === 'withdraw') && transaction.rupeeAmount && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            ₹{transaction.rupeeAmount.toFixed(2)}
                                        </p>
                                    )}
                                    {transaction.transactionType === 'spend' && !transaction.rupeeAmount && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            ≈ ₹{coinsToRupees(transaction.coinAmount).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            { }
            {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={!pagination.hasMore || loading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
