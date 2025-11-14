"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { MemberProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useState } from "react";

function SettingsContent() {
 const [settings, setSettings] = useState({
 notifications: true,
 autoRenew: false,
 emailUpdates: true,
 darkMode: false,
 });

 const handleToggle = (key: keyof typeof settings) => {
 setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
 };

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">Settings</h1>
 <p className="text-neutral-dark-gray">
 Manage your account preferences
 </p>
 </div>

 {}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-xl font-semibold text-primary-navy mb-4">
 Notifications
 </h2>
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Push Notifications</p>
 <p className="text-sm text-gray-600">
 Receive notifications about new content
 </p>
 </div>
 <button
 onClick={() => handleToggle("notifications")}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 settings.notifications ? "bg-blue-600" : "bg-gray-200"
 }`}
 >
 <span
 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
 settings.notifications ? "translate-x-6" : "translate-x-1"
 }`}
 />
 </button>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">Email Updates</p>
 <p className="text-sm text-gray-600">
 Receive email notifications
 </p>
 </div>
 <button
 onClick={() => handleToggle("emailUpdates")}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 settings.emailUpdates ? "bg-blue-600" : "bg-gray-200"
 }`}
 >
 <span
 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
 settings.emailUpdates ? "translate-x-6" : "translate-x-1"
 }`}
 />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function SettingsPage() {
 return (
 <MemberProtectedRoute>
 <SettingsContent />
 </MemberProtectedRoute>
 );
}
