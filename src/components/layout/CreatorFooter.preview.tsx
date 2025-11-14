

import CreatorFooter from './CreatorFooter'

export default function CreatorFooterPreview() {
 return (
 <div className="space-y-8 p-8 bg-gray-100">
 <div>
 <h2 className="text-2xl font-bold mb-4 text-primary-navy">CreatorFooter Component Preview</h2>
 <p className="text-neutral-dark-gray mb-6">
 Below are examples of the CreatorFooter component in different layouts and contexts.
 </p>
 </div>

 {}
 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
 <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
 <h3 className="text-xl font-bold mb-2">Example 1: Default Footer</h3>
 <p className="text-sm opacity-90">Standard CreatorFooter with all default settings</p>
 </div>
 <div className="min-h-[200px] bg-gray-50 p-6">
 <p className="text-center text-gray-500">Creator Page Content Area</p>
 </div>
 <CreatorFooter />
 </div>

 {}
 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
 <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
 <h3 className="text-xl font-bold mb-2">Example 2: Footer with Shadow</h3>
 <p className="text-sm opacity-90">CreatorFooter with custom shadow styling</p>
 </div>
 <div className="min-h-[200px] bg-gray-50 p-6">
 <p className="text-center text-gray-500">Creator Dashboard Content</p>
 </div>
 <CreatorFooter className="shadow-2xl" />
 </div>

 {}
 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
 <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white">
 <h3 className="text-xl font-bold mb-2">Example 3: Mobile View</h3>
 <p className="text-sm opacity-90">How the footer appears on mobile devices (max-width: 400px)</p>
 </div>
 <div className="max-w-[400px] mx-auto border-x border-gray-300">
 <div className="min-h-[150px] bg-gray-50 p-4">
 <p className="text-center text-gray-500 text-sm">Mobile Creator View</p>
 </div>
 <CreatorFooter />
 </div>
 </div>

 {}
 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
 <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
 <h3 className="text-xl font-bold mb-2">Example 4: Full Page Layout</h3>
 <p className="text-sm opacity-90">CreatorFooter in a complete page layout with header and content</p>
 </div>
 <div className="flex flex-col min-h-[400px]">
 {}
 <div className="bg-primary-navy text-white p-4">
 <div className="container mx-auto flex justify-between items-center">
 <span className="font-bold text-lg">Crensa Creator</span>
 <nav className="space-x-4 text-sm">
 <span>Dashboard</span>
 <span>Analytics</span>
 <span>Earnings</span>
 </nav>
 </div>
 </div>
 
 {}
 <div className="flex-1 bg-gray-50 p-6">
 <div className="container mx-auto">
 <h2 className="text-2xl font-bold mb-4">Creator Dashboard</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-white p-4 rounded-lg shadow">
 <h3 className="font-semibold mb-2">Total Views</h3>
 <p className="text-3xl font-bold text-accent-pink">12,345</p>
 </div>
 <div className="bg-white p-4 rounded-lg shadow">
 <h3 className="font-semibold mb-2">Coins Earned</h3>
 <p className="text-3xl font-bold text-accent-pink">5,678</p>
 </div>
 <div className="bg-white p-4 rounded-lg shadow">
 <h3 className="font-semibold mb-2">Videos</h3>
 <p className="text-3xl font-bold text-accent-pink">42</p>
 </div>
 </div>
 </div>
 </div>
 
 {}
 <CreatorFooter />
 </div>
 </div>

 {}
 <div className="bg-white rounded-lg shadow-lg p-6">
 <h3 className="text-xl font-bold mb-4 text-primary-navy">Footer Links Reference</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b-2 border-gray-300">
 <th className="p-3 font-semibold">Link Text</th>
 <th className="p-3 font-semibold">URL</th>
 <th className="p-3 font-semibold">Description</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-gray-200">
 <td className="p-3">Creator Resources</td>
 <td className="p-3 font-mono text-sm">/creator/resources</td>
 <td className="p-3 text-sm">Getting started guides and best practices</td>
 </tr>
 <tr className="border-b border-gray-200">
 <td className="p-3">Creator Guidelines</td>
 <td className="p-3 font-mono text-sm">/creator/guidelines</td>
 <td className="p-3 text-sm">Content policies and monetization rules</td>
 </tr>
 <tr className="border-b border-gray-200">
 <td className="p-3">Analytics Dashboard</td>
 <td className="p-3 font-mono text-sm">/creator/analytics</td>
 <td className="p-3 text-sm">View performance metrics</td>
 </tr>
 <tr className="border-b border-gray-200">
 <td className="p-3">Earnings & Payouts</td>
 <td className="p-3 font-mono text-sm">/creator/earnings</td>
 <td className="p-3 text-sm">Manage earnings and withdrawals</td>
 </tr>
 <tr className="border-b border-gray-200">
 <td className="p-3">Creator Support</td>
 <td className="p-3 font-mono text-sm">/creator/support</td>
 <td className="p-3 text-sm">Creator-specific help and FAQs</td>
 </tr>
 <tr className="border-b border-gray-200">
 <td className="p-3">Terms of Service</td>
 <td className="p-3 font-mono text-sm">/terms</td>
 <td className="p-3 text-sm">Platform terms and conditions</td>
 </tr>
 <tr className="border-b border-gray-200">
 <td className="p-3">Privacy Policy</td>
 <td className="p-3 font-mono text-sm">/privacy</td>
 <td className="p-3 text-sm">Privacy policy and data handling</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )
}
