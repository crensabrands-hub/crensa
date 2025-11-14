'use client';

export default function VideoModeration() {
 return (
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <h3 className="text-lg font-medium text-gray-900 mb-4">Video Moderation</h3>
 <p className="text-gray-600">Video moderation interface will be implemented here.</p>
 <div className="mt-4 space-y-4">
 <div className="border border-gray-200 rounded-lg p-4">
 <h4 className="font-medium text-gray-900">Features to implement:</h4>
 <ul className="mt-2 text-sm text-gray-600 space-y-1">
 <li>• View all videos with moderation status</li>
 <li>• Filter by moderation status (pending, approved, rejected, flagged)</li>
 <li>• Approve or reject videos</li>
 <li>• Add moderation notes</li>
 <li>• Bulk actions for multiple videos</li>
 </ul>
 </div>
 </div>
 </div>
 );
}