export const dynamic = 'force-dynamic';

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function vincularCuenta(formData: FormData) {
  "use server";
  const clerkId = formData.get("clerkId") as string;
  const dni = formData.get("dni") as string;
  const phone = formData.get("phone") as string;

  // Buscar member por DNI + teléfono
  const member = await prisma.member.findFirst({
    where: { dni, phone },
  });

  if (!member) {
    // Crear nuevo member
    await prisma.member.create({
      data: {
        clerkUserId: clerkId,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        dni,
        email: formData.get("email") as string,
        phone,
        birthDate: new Date(formData.get("birthDate") as string),
        address: (formData.get("address") as string) || null,
        city: (formData.get("city") as string) || null,
        status: "PENDING",
        createdBy: "self-registration",
      },
    });
  } else if (!member.clerkUserId) {
    // Member existe pero no tiene clerkUserId → vincular
    await prisma.member.update({
      where: { id: member.id },
      data: { clerkUserId: clerkId },
    });
  } else if (member.clerkUserId !== clerkId) {
    // Member existe con OTRO clerkUserId → actualizar al nuevo
    await prisma.member.update({
      where: { id: member.id },
      data: { clerkUserId: clerkId },
    });
  }

  revalidatePath("/");
  redirect("/");
}

export default async function CompletarPerfilPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Si ya tiene member vinculado con este clerkUserId, ir al dashboard
  const existing = await prisma.member.findUnique({
    where: { clerkUserId: user.id },
  });
  if (existing) redirect("/");

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Completa tu perfil</h1>
          <p className="text-sm text-zinc-400 mt-1">Vinculá tu cuenta con el gimnasio</p>
        </div>

        <form action={vincularCuenta} className="space-y-4">
          <input type="hidden" name="clerkId" value={user.id} />
          <input type="hidden" name="firstName" value={user.firstName || ""} />
          <input type="hidden" name="lastName" value={user.lastName || ""} />
          <input type="hidden" name="email" value={user.emailAddresses[0]?.emailAddress || ""} />

          <div>
            <label className="block text-sm text-zinc-400 mb-1">DNI</label>
            <input name="dni" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Teléfono</label>
            <input name="phone" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Fecha de nacimiento</label>
            <input name="birthDate" type="date" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Dirección</label>
            <input name="address" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Ciudad</label>
            <input name="city" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium">
            Vincular cuenta
          </button>
        </form>
      </div>
    </div>
  );
}