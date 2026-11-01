"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />

      <div className="w-full max-w-sm relative z-10">
        
        {/* Branding */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-lg shadow-black/5 overflow-hidden mb-2 border border-zinc-300/50">
            {/* Usamos img normal para evitar el optimizador de Vercel */}
            <img
              src="/brand/logo.png" 
              alt="MIPLAN"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">
              Cultiva Fitness MIPLAN
            </h1>
            <p className="text-sm text-zinc-600 mt-1.5 font-medium">
              Accedé a tu App y seguí tu progreso
            </p>
          </div>
        </div>

        {/* Tarjeta Blanca de Clerk */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-zinc-300/50 overflow-hidden">
          <SignIn
            routing="hash"
            forceRedirectUrl="/"
            signUpForceRedirectUrl="/completar-perfil"
            appearance={{
              variables: {
                colorPrimary: "#22c55e",
                colorBackground: "#ffffff",
                // Quitamos colorText y colorInput* para evitar el error de TypeScript
                borderRadius: "1rem",
              },
              elements: {
                card: "bg-transparent shadow-none p-6",
                cardBox: "shadow-none w-full",
                
                // TEXTOS FORZADOS CON ! (Esto es lo que arregla Vercel)
                headerTitle: "!text-zinc-900 text-xl font-bold",
                headerSubtitle: "!text-zinc-500 text-sm",
                formFieldLabel: "!text-zinc-700 font-medium",
                footerActionText: "!text-zinc-500 text-sm",
                footerActionLink: "!text-green-600 hover:!text-green-700 font-semibold",
                dividerText: "!text-zinc-400 text-xs",
                
                // INPUTS FORZADOS CON !
                formFieldInput: "!bg-zinc-100 !border-transparent !text-zinc-900 placeholder:!text-zinc-500 focus:!ring-green-500/20 focus:!border-green-500 h-11 rounded-xl",
                
                // BOTÓN PRINCIPAL
                formButtonPrimary: "!bg-green-600 hover:!bg-green-700 !text-white font-semibold h-11 rounded-xl shadow-lg shadow-green-600/20 transition-all",
                
                // BOTONES SOCIALES
                socialButtonsBlockButton: "!border-zinc-200 !text-zinc-700 hover:!bg-zinc-50 h-11 rounded-xl",
                socialButtonsBlockButtonText: "font-medium",
                
                // ARREGLO DEL FOOTER
                footer: "bg-transparent border-none mt-2",
                footerPages: "hidden",
              }
            }}
          />
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6 font-medium">
          Al iniciar sesión, aceptás nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}