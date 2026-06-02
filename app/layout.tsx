import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shifumi",
  description: "Jeu de Pierre-Papier-Ciseaux à deux joueurs en temps réel.",
  applicationName: "Shifumi",
  appleWebApp: {
    capable: true,
    title: "Shifumi",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#DAA06D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={fraunces.variable}>
      <body >
        <Providers>
          {children}
        </Providers>
        </body>
    </html>
  );
}
