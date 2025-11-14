"use client";

import React, { ReactNode } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useAuthContext } from "@/contexts/AuthContext";
import CreatorLayout from "./CreatorLayout";
import { LayoutLoading } from "./LayoutUtils";
import { AnimatedTextLoader } from "../ui/AnimatedTextLoader";

interface LayoutWrapperProps {
 children: ReactNode;
 forceLayout?: "creator" | "member" | "public";
}

export default function LayoutWrapper({
 children,
 forceLayout,
}: LayoutWrapperProps) {
 const { currentLayout, isLayoutLoading } = useLayout();
 const { isLoading: authLoading } = useAuthContext();

 if (isLayoutLoading || authLoading) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-neutral-gray via-white to-neutral-light-gray">
 <div className="w-full max-w-md px-8">
 <AnimatedTextLoader text="CRENSA" />
 </div>
 </div>
 );
 }

 const layoutType = forceLayout || currentLayout;

 switch (layoutType) {
 case "creator":
 return <CreatorLayout>{children}</CreatorLayout>;

 case "member":

 return <>{children}</>;

 case "public":
 default:

 return <>{children}</>;
 }
}
