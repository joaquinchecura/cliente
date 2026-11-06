"use client";

// app/sign-up/[[...sign-up]]/page.tsx  (o donde esté tu sign-up)
import { SignUp } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-auth-appearance";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-zinc-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-lg shadow-black/5 overflow-hidden mb-2 border border-zinc-300/50">
            <img src="/brand/logo.png" alt="MIPLAN" className="w-32 h-32 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">Cultiva Fitness MIPLAN</h1>
            <p className="text-sm text-zinc-600 mt-1.5 font-medium">Creá tu cuenta y empezá tu entrenamiento</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-zinc-300/50 overflow-hidden">
          <SignUp
            routing="hash"
            forceRedirectUrl="/completar-perfil"
            signInForceRedirectUrl="/"
            appearance={clerkAuthAppearance}
          />
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6 font-medium">
          Al registrarte, aceptás nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}