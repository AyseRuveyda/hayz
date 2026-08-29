"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import { ChatProvider } from "@/components/chat/ChatContext";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <I18nProvider>
        <ChatProvider>{children}</ChatProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
