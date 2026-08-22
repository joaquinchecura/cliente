import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CultivaFitness MIPLAN",
  description: "App del cliente CultivaFitness",
  keywords: ["fitness", "entrenamiento", "gym", "rutinas", "MiPlan", "Cultiva Fitness"],
  authors: [{ name: "Cultiva Fitness" }],
  manifest: "/miplan/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://miplan.cultivafitness.com",
    siteName: "MiPlan",
    title: "CultivaFitness MIPLAN",
    description: "App del cliente CultivaFitness",
    images: [
      {
        url: "/miplan/og-image.png",
        width: 1200,
        height: 630,
        alt: "MiPlan - Cultiva Fitness",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CultivaFitness MIPLAN",
    description: "App del cliente CultivaFitness",
    images: ["/miplan/twitter-card.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MiPlan",
  },
  other: {
    "msapplication-TileColor": "#050508",
    "msapplication-TileImage": "/miplan/mstile-150x150.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      
        
          {children}
        
      
    
  );
}