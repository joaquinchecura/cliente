"use client";

import { SignUp } from "@clerk/nextjs";
import { Dumbbell } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo y branding */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/15 rounded-2xl ring-1 ring-primary/20 mb-2">
            <Dumbbell className="w-8 h-8 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Cultiva Fitness MI PLAN
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
              appearance={{
                elements: {
                  // Card base
                  card: "bg-transparent shadow-none p-0",

                  // Formulario
                  formFieldLabel: "text-sm font-medium text-muted-foreground mb-1.5 block",
                  formFieldInput: 
                    "w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all",
                  formFieldErrorText: "text-xs text-destructive mt-1",
                  formFieldSuccessText: "text-xs text-emerald-400 mt-1",

                  // Botón primario
                  formButtonPrimary: 
                    "w-full h-10 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]",

                  // Social buttons
                  socialButtonsBlockButton: 
                    "w-full h-10 bg-muted/50 border border-border/60 rounded-lg text-foreground hover:bg-muted transition-all duration-200 flex items-center justify-center gap-2",
                  socialButtonsBlockButtonText: "text-sm font-medium",
                  socialButtonsBlockButtonArrow: "hidden",

                  // Divider
                  dividerLine: "bg-border/60",
                  dividerText: "text-xs text-muted-foreground",

                  // Footer
                  footer: "mt-4 pt-4 border-t border-border/40",
                  footerActionText: "text-sm text-muted-foreground",
                  footerActionLink: 
                    "text-sm font-semibold text-primary hover:text-primary/80 transition-colors",

                  // Otros
                  identityPreview: "bg-muted/50 border-border/60 rounded-lg p-3 text-sm text-foreground",
                  identityPreviewText: "text-foreground",
                  identityPreviewEditButton: "text-primary hover:text-primary/80",
                  formResendCodeLink: "text-primary hover:text-primary/80 text-sm",
                  otpCodeFieldInput: "bg-muted/50 border-border/60 rounded-lg text-foreground",
                  passwordFieldInput: "w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/60 text-foreground",
                  passwordFieldHintText: "text-xs text-muted-foreground",
                  formFieldWarningText: "text-xs text-amber-400",
                },
              }}
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