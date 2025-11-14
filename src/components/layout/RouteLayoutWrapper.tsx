"use client";

import React, { ReactNode } from "react";
import RoleBasedLayoutWrapper from "./RoleBasedLayoutWrapper";

interface RouteLayoutWrapperProps {
 children: ReactNode;
}

export default function RouteLayoutWrapper({
 children,
}: RouteLayoutWrapperProps) {
 return (
 <RoleBasedLayoutWrapper>
 {children}
 </RoleBasedLayoutWrapper>
 );
}
