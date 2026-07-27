export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TrendingUp, Scale } from "lucide-react";

async function registrarPeso(formData: FormData) {
  "use server";
  await prisma.weightLog.create({
    data: {
      memberId: formData.get("memberId") as string,
      weight: parseFloat(formData.get("weight") as string),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/dashboard/progreso");
}

export default async function ProgresoPage() {
  const member = await getCurrentMember();

  const [weightLogs, progressLogs] = await Promise.all([
    prisma.weightLog.findMany({
      where: { memberId: member.id },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.progressLog.findMany({
      where: { memberId: member.id },
      include: { routine: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📈 Mi Progreso</h2>

      {/* Registrar peso */}
      <form action={registrarPeso} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-end">
        <input type="hidden" name="memberId" value={member.id} />
        <div className="flex-1 w-full">
          <label className="block text-xs text-zinc-500 mb-1">Nuevo peso (kg)</label>
          <input
            name="weight"
            type="number"
            step="0.1"
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex-[2] w-full">
          <label className="block text-xs text-zinc-500 mb-1">Notas (opcional)</label>
          <input
            name="notes"
            type="text"
            placeholder="Ej: Ayuno, post-entreno..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto">
          <Scale size={16} className="inline mr-1" /> Guardar
        </button>
      </form>

      {/* Historial de peso */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Historial de Peso</h3>
        {weightLogs.length === 0 ? (
          <p className="text-zinc-600 text-sm">No hay registros aún.</p>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {weightLogs.map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{Number(log.weight)} kg</p>
                  {log.notes && <p className="text-xs text-zinc-500">{log.notes}</p>}
                </div>
                <p className="text-xs text-zinc-600">{new Date(log.date).toLocaleDateString("es-AR")}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progreso en ejercicios */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Progreso en Ejercicios</h3>
        {progressLogs.length === 0 ? (
          <p className="text-zinc-600 text-sm">No hay registros aún.</p>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {progressLogs.map((log) => (
              <div key={log.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{log.routine.name}</p>
                  <p className="text-xs text-zinc-600">{new Date(log.date).toLocaleDateString("es-AR")}</p>
                </div>
                <p className="text-sm text-zinc-400 mt-1">
                  {log.setsCompleted} series x {log.repsCompleted} @ {Number(log.weightUsed)} kg
                </p>
                {log.notes && <p className="text-xs text-zinc-500 mt-1">{log.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}