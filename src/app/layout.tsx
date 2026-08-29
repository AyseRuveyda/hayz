import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hayz Takvimi",
  description: "Hayız, nifas ve istihâze hesaplama ve ilmihal platformu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hayz Takvimi",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF7F6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="safe-top">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
