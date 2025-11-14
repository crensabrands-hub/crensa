import CreatorFooter from './CreatorFooter'

export default function CreatorFooterExample() {
 return (
 <div className="min-h-screen flex flex-col">
 {}
 <div className="flex-1 bg-gray-50 p-8">
 <div className="max-w-4xl mx-auto">
 <h1 className="text-3xl font-bold text-primary-navy mb-4">Creator Dashboard</h1>
 <p className="text-neutral-dark-gray mb-6">
 This is an example of how the CreatorFooter component appears at the bottom of creator pages.
 </p>
 
 <div className="bg-white rounded-lg shadow-md p-6 mb-6">
 <h2 className="text-xl font-semibold mb-4">Your Content</h2>
 <p className="text-neutral-dark-gray">
 Manage your videos, series, and earnings from this dashboard.
 </p>
 </div>

 <div className="bg-white rounded-lg shadow-md p-6">
 <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
 <p className="text-neutral-dark-gray">
 Track your performance and audience engagement.
 </p>
 </div>
 </div>
 </div>

 {}
 <CreatorFooter />
 </div>
 )
}

export function CreatorFooterWithCustomClass() {
 return (
 <div className="min-h-screen flex flex-col">
 <div className="flex-1 bg-gray-50 p-8">
 <h1 className="text-2xl font-bold text-center">Custom Styled Footer</h1>
 </div>
 <CreatorFooter className="shadow-lg" />
 </div>
 )
}

export function CreatorFooterMobileExample() {
 return (
 <div className="max-w-md mx-auto border border-gray-300">
 <div className="bg-gray-50 p-4">
 <h1 className="text-xl font-bold">Mobile View</h1>
 <p className="text-sm text-gray-600">
 The footer adapts to mobile screens with stacked layout.
 </p>
 </div>
 <CreatorFooter />
 </div>
 )
}
