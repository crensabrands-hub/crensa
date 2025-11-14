

import { CoinTransactionHistory } from './CoinTransactionHistory'

export function CoinTransactionHistoryExamples() {
 return (
 <div className="space-y-8 p-8 bg-gray-50">
 <h1 className="text-3xl font-bold">CoinTransactionHistory Examples</h1>

 {}
 <section>
 <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
 <p className="text-gray-600 mb-4">
 Default transaction history with all features enabled
 </p>
 <CoinTransactionHistory />
 </section>

 {}
 <section>
 <h2 className="text-2xl font-semibold mb-4">Custom Page Limit</h2>
 <p className="text-gray-600 mb-4">
 Show only 10 transactions per page
 </p>
 <CoinTransactionHistory limit={10} />
 </section>

 {}
 <section>
 <h2 className="text-2xl font-semibold mb-4">Custom Styling</h2>
 <p className="text-gray-600 mb-4">
 Apply custom classes for different layouts
 </p>
 <CoinTransactionHistory className="max-w-4xl mx-auto" />
 </section>

 {}
 <section>
 <h2 className="text-2xl font-semibold mb-4">In a Modal Context</h2>
 <p className="text-gray-600 mb-4">
 Transaction history can be displayed in a modal
 </p>
 <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl">
 <CoinTransactionHistory limit={5} />
 </div>
 </section>

 {}
 <section>
 <h2 className="text-2xl font-semibold mb-4">Dashboard Widget</h2>
 <p className="text-gray-600 mb-4">
 Compact view for dashboard integration
 </p>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="bg-white p-6 rounded-lg shadow">
 <h3 className="text-xl font-bold mb-4">Account Overview</h3>
 <div className="space-y-4">
 <div className="flex justify-between">
 <span>Current Balance</span>
 <span className="font-bold">🪙 1,250 coins</span>
 </div>
 <div className="flex justify-between">
 <span>Total Purchased</span>
 <span>🪙 5,000 coins</span>
 </div>
 <div className="flex justify-between">
 <span>Total Spent</span>
 <span>🪙 3,750 coins</span>
 </div>
 </div>
 </div>
 <div>
 <CoinTransactionHistory limit={5} />
 </div>
 </div>
 </section>
 </div>
 )
}

export function UserDashboardWithHistory() {
 return (
 <div className="container mx-auto px-4 py-8">
 <div className="mb-8">
 <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
 <p className="text-gray-600">Manage your coins and view transaction history</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
 <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
 <div className="text-sm opacity-90 mb-2">Current Balance</div>
 <div className="text-4xl font-bold">🪙 1,250</div>
 <div className="text-sm opacity-90 mt-2">≈ ₹62.50</div>
 </div>
 
 <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
 <div className="text-sm opacity-90 mb-2">Total Purchased</div>
 <div className="text-4xl font-bold">🪙 5,000</div>
 <div className="text-sm opacity-90 mt-2">≈ ₹250.00</div>
 </div>
 
 <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
 <div className="text-sm opacity-90 mb-2">Total Spent</div>
 <div className="text-4xl font-bold">🪙 3,750</div>
 <div className="text-sm opacity-90 mt-2">≈ ₹187.50</div>
 </div>
 </div>

 <CoinTransactionHistory />
 </div>
 )
}

export function TransactionHistoryModal({ 
 isOpen, 
 onClose 
}: { 
 isOpen: boolean
 onClose: () => void 
}) {
 if (!isOpen) return null

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
 <div className="p-4 border-b border-gray-200 flex items-center justify-between">
 <h2 className="text-xl font-bold">Transaction History</h2>
 <button
 onClick={onClose}
 className="text-gray-500 hover:text-gray-700 text-2xl"
 >
 ×
 </button>
 </div>
 <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
 <CoinTransactionHistory limit={15} />
 </div>
 </div>
 </div>
 )
}

export function CompactTransactionHistory() {
 return (
 <div className="bg-white rounded-lg shadow p-4">
 <h3 className="font-bold mb-3">Recent Transactions</h3>
 <CoinTransactionHistory limit={5} className="shadow-none" />
 </div>
 )
}
