import React from "react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { CommunityFeed } from "@/components/portal/CommunityFeed";

const Community = () => {
  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Header />
      
      <main className="pt-24 min-h-[calc(100vh-80px)]">
        <CommunityFeed />
      </main>

      <BottomTabBar />
    </div>
  );
};

export default Community;
