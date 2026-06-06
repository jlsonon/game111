import { AppShell } from "@/components/app-shell";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PARTYVERSE",
  description: "Installable realtime multiplayer party gaming platform.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PARTYVERSE",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#090a12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#090a12]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
