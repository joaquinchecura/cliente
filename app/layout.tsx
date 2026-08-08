import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
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
      <html lang="es" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
        {/* 
          ✅ FIX: Sacamos bg-zinc-950 text-zinc-100 hardcodeados
          Ahora el body usa las variables CSS del :root (oscuro por defecto)
          Todos los componentes de Shadcn/UI heredan los colores correctos
        */}
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}