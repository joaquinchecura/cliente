import { SignOutButton } from "@clerk/nextjs";

export default function CuentaSuspendidaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-foreground">Acceso no disponible</h1>
        <p className="text-sm text-muted-foreground">
          Tu cuenta no está habilitada en este momento. Contactá a tu gimnasio o profesional para
          que te ayude a reactivarla.
        </p>
        <SignOutButton redirectUrl="/sign-in">
          <button className="text-sm font-semibold text-green-500 hover:text-green-400">
            Cerrar sesión
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}