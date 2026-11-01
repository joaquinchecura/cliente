"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-zinc-950 to-zinc-950" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo y branding */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 ring-1 ring-zinc-800 shadow-2xl shadow-black/20 overflow-hidden mb-2">
            {/* IMPORTANTE: Asegurate que esta imagen exista en tu public/ */}
            <img
              src="/miplan/logo-clean.png" 
              alt="MIPLAN"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cultiva Fitness MIPLAN
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5">
              Accedé a tu App y seguí tu progreso
            </p>
          </div>
        </div>

        {/* Tarjeta de login */}
        <div className="w-full">
          <SignIn
            routing="hash"
            forceRedirectUrl="/"
            signUpForceRedirectUrl="/completar-perfil"
            appearance={{
              variables: {
                colorPrimary: "#22c55e",
                colorBackground: "#18181b", 
                borderRadius: "0.75rem",
              },
              elements: {
                // Contenedor principal
                card: "!bg-zinc-900 !border !border-zinc-800 !shadow-2xl !rounded-2xl !p-6",
                
                // Textos (Forzados a blanco con !)
                headerTitle: "!text-white text-lg font-semibold text-center",
                headerSubtitle: "!text-zinc-400 text-sm text-center",
                formFieldLabel: "!text-zinc-300 text-sm font-medium mb-1.5 block",
                dividerText: "!text-zinc-500 text-xs",
                footerActionText: "!text-zinc-400 text-sm",
                footerActionLink: "!text-green-500 hover:!text-green-400 text-sm font-semibold transition-colors",
                
                // Inputs
                formFieldInput: "!bg-zinc-950 !border-zinc-800 !text-white placeholder:!text-zinc-500 focus:!ring-green-500/50 focus:!border-green-500/50 h-10 rounded-lg px-3 transition-all",
                
                // Botones sociales
                socialButtonsBlockButton: "!bg-zinc-800 !border-zinc-700 !text-white hover:!bg-zinc-700 h-10 rounded-lg transition-all",
                socialButtonsBlockButtonText: "!text-zinc-300 font-medium",
                
                // Botón principal
                formButtonPrimary: "!bg-green-600 hover:!bg-green-500 !text-white font-semibold h-10 rounded-lg shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] mt-4",
              }
            }}
          />
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Al iniciar sesión, aceptás nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}