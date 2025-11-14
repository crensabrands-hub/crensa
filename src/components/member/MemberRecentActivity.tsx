"use client";

interface MemberActivity {
 id: string;
 type: 'video_watch' | 'creator_follow' | 'credit_purchase' | 'coin_purchase' | 'profile_visit';
 title: string;
 description: string;
 timestamp: Date;
 metadata?: any;
}

interface MemberRecentActivityProps {
 activities: MemberActivity[];
}

export function MemberRecentActivity({ activities }: MemberRecentActivityProps) {
 const getActivityColor = (type: string) => {
 switch (type) {
 case 'video_watch': return 'bg-accent-teal';
 case 'creator_follow': return 'bg-accent-green';
 case 'credit_purchase': return 'bg-accent-pink';
 case 'coin_purchase': return 'bg-accent-pink';
 case 'profile_visit': return 'bg-primary-neon-yellow';
 default: return 'bg-neutral-dark-gray';
 }
 };

 const getActivityIcon = (type: string) => {
 switch (type) {
 case 'video_watch':
 return (
 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8 5v14l11-7z"/>
 </svg>
 );
 case 'creator_follow':
 return (
 <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 );
 case 'credit_purchase':
 case 'coin_purchase':
 return (
 <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 );
 case 'profile_visit':
 return (
 <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 );
 default:
 return (
 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
 <circle cx="12" cy="12" r="2"/>
 </svg>
 );
 }
 };

 const getTimeAgo = (timestamp: Date) => {
 const now = new Date();
 const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
 
 if (diffInHours < 1) return 'Less than an hour ago';
 if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
 
 const diffInDays = Math.floor(diffInHours / 24);
 if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
 
 return timestamp.toLocaleDateString();
 };

 return (
 <div className="card">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">
 Recent Activity
 </h3>
 <div className="space-y-4">
 {activities.length > 0 ? (
 activities.map((activity) => (
 <div key={activity.id} className="flex items-start space-x-3">
 <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2 flex-shrink-0`}></div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-primary-navy">
 {activity.title}
 </p>
 <p className="text-xs text-neutral-dark-gray mb-1">
 {activity.description}
 </p>
 <p className="text-xs text-neutral-dark-gray">
 {getTimeAgo(activity.timestamp)}
 </p>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-8">
 <div className="w-12 h-12 bg-neutral-light-gray rounded-full flex items-center justify-center mx-auto mb-3">
 <svg className="w-6 h-6 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <p className="text-sm text-neutral-dark-gray mb-1">
 No recent activity
 </p>
 <p className="text-xs text-neutral-dark-gray">
 Start exploring content to see your activity here
 </p>
 </div>
 )}
 </div>
 </div>
 );
}