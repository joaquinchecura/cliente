"use client";

import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo y branding */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-card ring-1 ring-border shadow-2xl shadow-black/20 overflow-hidden mb-2">
            <Image
              src="/brand/logo-clean.png"
              alt="MIPLAN"
              width={64}
              height={64}
              className="w-14 h-14 object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Cultiva Fitness MIPLAN
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Creá tu cuenta y empezá tu entrenamiento
            </p>
          </div>
        </div>

        {/* Card de registro */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/60 p-1 shadow-2xl shadow-black/20">
          <div className="bg-card rounded-xl p-5">
            <SignUp
              routing="hash"
              forceRedirectUrl="/completar-perfil"
              signInForceRedirectUrl="/"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Al registrarte, aceptás nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}