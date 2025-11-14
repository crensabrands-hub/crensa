import { Metadata } from "next";
import MemberLayout from "@/components/layout/MemberLayout";
import { WatchHistoryComponent } from "@/components/member/WatchHistory";

export const metadata: Metadata = {
 title: "Watch History | Crensa",
 description: "View your watch history and recently viewed content",
};

export default function HistoryPage() {
 return (
 <MemberLayout showSidebar={true}>
 <WatchHistoryComponent />
 </MemberLayout>
 );
}