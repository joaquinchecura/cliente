export const dynamic = 'force-dynamic';

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { User, Phone, MapPin, Calendar, Heart, FileText, AlertCircle } from "lucide-react";

async function vincularCuenta(formData: FormData) {
  "use server";
  const clerkId = formData.get("clerkId") as string;
  const dni = formData.get("dni") as string;
  const phone = formData.get("phone") as string;

  const member = await prisma.member.findFirst({
    where: { dni, phone },
  });

  const data = {
    clerkUserId: clerkId,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    dni,
    email: formData.get("email") as string,
    phone,
    birthDate: new Date(formData.get("birthDate") as string),
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    emergencyContactName: (formData.get("emergencyContactName") as string) || null,
    emergencyContactPhone: (formData.get("emergencyContactPhone") as string) || null,
    medicalNotes: (formData.get("medicalNotes") as string) || null,
    internalNotes: (formData.get("internalNotes") as string) || null,
    status: "PENDING" as const,
    createdBy: "self-registration",
  };

  if (!member) {
    await prisma.member.create({ data });
  } else if (!member.clerkUserId) {
    await prisma.member.update({ where: { id: member.id }, data: { clerkUserId: clerkId } });
  } else if (member.clerkUserId !== clerkId) {
    await prisma.member.update({ where: { id: member.id }, data: { clerkUserId: clerkId } });
  }

  revalidatePath("/");
  redirect("/");
}

export default async function CompletarPerfilPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const existing = await prisma.member.findUnique({
    where: { clerkUserId: user.id },
  });
  if (existing) redirect("/");

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Completa tu perfil</h1>
          <p className="text-sm text-zinc-400">Vinculá tu cuenta con el gimnasio para acceder a tu rutina, progreso y más.</p>
        </div>

        <form action={vincularCuenta} className="space-y-6">
          {/* Hidden fields from Clerk */}
          <input type="hidden" name="clerkId" value={user.id} />
          <input type="hidden" name="firstName" value={user.firstName || ""} />
          <input type="hidden" name="lastName" value={user.lastName || ""} />
          <input type="hidden" name="email" value={user.emailAddresses[0]?.emailAddress || ""} />

          {/* Datos personales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <User size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Datos personales</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Nombre</label>
                <input
                  value={user.firstName || ""}
                  disabled
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Apellido</label>
                <input
                  value={user.lastName || ""}
                  disabled
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
                <input
                  value={user.emailAddresses[0]?.emailAddress || ""}
                  disabled
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">DNI *</label>
                <input
                  name="dni"
                  required
                  placeholder="12345678"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Teléfono *</label>
                <input
                  name="phone"
                  required
                  placeholder="+54 9 11 1234-5678"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Fecha de nacimiento *</label>
                <input
                  name="birthDate"
                  type="date"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <MapPin size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Ubicación</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Dirección</label>
                <input
                  name="address"
                  placeholder="Av. Siempre Viva 123"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Ciudad</label>
                <input
                  name="city"
                  placeholder="Buenos Aires"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <Phone size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Contacto de emergencia</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Nombre</label>
                <input
                  name="emergencyContactName"
                  placeholder="Nombre del contacto"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Teléfono</label>
                <input
                  name="emergencyContactPhone"
                  placeholder="+54 9 11 8765-4321"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notas médicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <Heart size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Información médica</h2>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Notas médicas</label>
              <textarea
                name="medicalNotes"
                rows={3}
                placeholder="Alergias, condiciones preexistentes, lesiones, etc."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Notas internas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <FileText size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Notas adicionales</h2>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Notas internas</label>
              <textarea
                name="internalNotes"
                rows={2}
                placeholder="Cualquier información adicional que quieras compartir"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Al vincular tu cuenta, confirmás que los datos proporcionados son correctos. 
              Tu entrenador podrá ver esta información para personalizar tu rutina.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition-colors font-semibold text-sm"
          >
            Vincular cuenta
          </button>
        </form>
      </div>
    </div>
  );
}