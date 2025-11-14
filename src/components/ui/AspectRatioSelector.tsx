'use client';

import React, { useState } from 'react';
import { AspectRatio, AspectRatioOption } from '@/types';

interface AspectRatioSelectorProps {
 value: AspectRatio;
 onChange: (ratio: AspectRatio) => void;
 disabled?: boolean;
 className?: string;
}

const aspectRatioOptions: AspectRatioOption[] = [
 {
 value: '16:9',
 label: 'Landscape',
 description: 'Standard widescreen format (16:9)',
 isVertical: false,
 },
 {
 value: '9:16',
 label: 'Portrait',
 description: 'Mobile/Reel format (9:16)',
 isVertical: true,
 },
 {
 value: '1:1',
 label: 'Square',
 description: 'Instagram square format (1:1)',
 isVertical: false,
 },
 {
 value: '4:5',
 label: 'Portrait+',
 description: 'Instagram portrait format (4:5)',
 isVertical: true,
 },
 {
 value: '3:2',
 label: 'Photo',
 description: 'Classic photo format (3:2)',
 isVertical: false,
 },
 {
 value: '2:3',
 label: 'Photo Portrait',
 description: 'Portrait photo format (2:3)',
 isVertical: true,
 },
];

const AspectRatioPreview: React.FC<{ ratio: AspectRatio; isSelected: boolean }> = ({
 ratio,
 isSelected,
}) => {
 const getPreviewStyle = (ratio: AspectRatio) => {
 const ratioMap: Record<AspectRatio, { width: number; height: number }> = {
 '16:9': { width: 32, height: 18 },
 '9:16': { width: 18, height: 32 },
 '1:1': { width: 24, height: 24 },
 '4:5': { width: 20, height: 25 },
 '3:2': { width: 30, height: 20 },
 '2:3': { width: 20, height: 30 },
 '5:4': { width: 25, height: 20 },
 };

 const dimensions = ratioMap[ratio];
 return {
 width: `${dimensions.width}px`,
 height: `${dimensions.height}px`,
 };
 };

 return (
 <div
 className={`
 border-2 rounded-sm transition-all duration-200
 ${isSelected 
 ? 'border-blue-500 bg-blue-50' 
 : 'border-gray-300 bg-gray-100'
 }
 `}
 style={getPreviewStyle(ratio)}
 />
 );
};

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
 value,
 onChange,
 disabled = false,
 className = '',
}) => {
 const [showTooltip, setShowTooltip] = useState<string | null>(null);

 const handleRatioSelect = (ratio: AspectRatio) => {
 if (!disabled) {
 onChange(ratio);
 }
 };

 return (
 <div className={`space-y-3 ${className}`}>
 <label className="block text-sm font-medium text-gray-700">
 Aspect Ratio
 </label>
 
 {}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
 {aspectRatioOptions.map((option) => (
 <div
 key={option.value}
 className="relative"
 onMouseEnter={() => setShowTooltip(option.value)}
 onMouseLeave={() => setShowTooltip(null)}
 >
 <button
 type="button"
 onClick={() => handleRatioSelect(option.value)}
 disabled={disabled}
 className={`
 w-full p-3 rounded-lg border-2 transition-all duration-200
 flex flex-col items-center space-y-2
 ${value === option.value
 ? 'border-blue-500 bg-blue-50 text-blue-700'
 : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
 }
 ${disabled 
 ? 'opacity-50 cursor-not-allowed' 
 : 'cursor-pointer hover:shadow-sm'
 }
 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
 `}
 >
 {}
 <div className="flex items-center justify-center h-8">
 <AspectRatioPreview 
 ratio={option.value} 
 isSelected={value === option.value} 
 />
 </div>
 
 {}
 <div className="text-center">
 <div className="text-xs font-medium">{option.label}</div>
 <div className="text-xs text-gray-500">{option.value}</div>
 </div>
 
 {}
 {option.isVertical && (
 <div className="absolute top-1 right-1">
 <div className="w-2 h-2 bg-purple-500 rounded-full" title="Vertical format" />
 </div>
 )}
 </button>
 
 {}
 {showTooltip === option.value && (
 <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg whitespace-nowrap opacity-0 animate-fade-in hidden sm:block">
 {option.description}
 <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
 </div>
 )}
 </div>
 ))}
 </div>
 
 {}
 <div className="text-sm text-gray-600">
 <span className="font-medium">Selected:</span>{' '}
 {aspectRatioOptions.find(opt => opt.value === value)?.description}
 </div>
 
 {}
 <div className="text-xs text-gray-500 space-y-1">
 <div>💡 <strong>Tips:</strong></div>
 <div>• 16:9 - Best for desktop viewing and traditional videos</div>
 <div>• 9:16 - Perfect for mobile and short-form content</div>
 <div>• 1:1 - Great for social media posts</div>
 </div>
 </div>
 );
};

export default AspectRatioSelector;