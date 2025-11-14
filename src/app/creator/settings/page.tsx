"use client";

import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import UserSettings from "@/components/profile/UserSettings";
import dynamic from "next/dynamic";

function CreatorSettingsContent() {
 return (
 <div className="space-y-6">
 {}
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">
 Creator Settings
 </h1>
 <p className="text-neutral-dark-gray">
 Manage your creator account preferences and settings.
 </p>
 </div>

 {}
 <UserSettings />
 </div>
 );
}

function CreatorSettingsPage() {
 return (
 <CreatorProtectedRoute>
 <CreatorSettingsContent />
 </CreatorProtectedRoute>
 );
}

export default CreatorSettingsPage;
