"use client";

import { Suspense, type ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FiqhChatDrawer } from "@/components/chat/FiqhChatDrawer";
import { NotificationBootstrap } from "@/components/providers/NotificationBootstrap";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <div className="sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 lg:block">
          <Suspense fallback={<div className="w-[260px]" />}>
            <Sidebar />
          </Suspense>
        </div>
        <main className="min-w-0 flex-1 px-3 py-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomNav />
      <FiqhChatDrawer />
      <NotificationBootstrap />
    </div>
  );
}
