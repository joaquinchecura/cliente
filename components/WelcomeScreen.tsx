"use client";

import { SignInButton } from "@clerk/nextjs";
import Image from "next/image";

export function WelcomeScreen() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Fondo con gradiente sutil (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        
        {/* Logo Isotipo */}
        <div className="mb-8 p-4 bg-zinc-900/50 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
          <Image
            src="/brand/isotipo.png"
            alt="MIPLAN Logo"
            width={80}
            height={80}
            className="w-20 h-20 object-contain mix-blend-screen"
            priority
          />
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
          Cultiva Fitness <span className="text-green-500">MIPLAN</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-10">
          Accedé a tu App y seguí tu progreso
        </p>

        {/* Botón de Login (Abre el modal de Clerk) */}
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] active:scale-[0.98]">
            Iniciar sesión
          </button>
        </SignInButton>

        <p className="mt-12 text-sm text-zinc-600">
          Desarrollado para CultivaFitness.app
        </p>
      </div>
    </div>
  );
}