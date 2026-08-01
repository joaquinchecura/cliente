import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cultiva - Tu Gimnasio",
  description: "App del gimnasio Cultiva",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}