"use client";

import { Suspense, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FiqhChatDrawer } from "@/components/chat/FiqhChatDrawer";
import { NotificationBootstrap } from "@/components/providers/NotificationBootstrap";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sol sidebar — sadece lg+ ekranlarda görünür */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Suspense fallback={<div className="w-[260px]" />}>
          <Sidebar />
        </Suspense>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
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
