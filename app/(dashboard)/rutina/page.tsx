import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { Dumbbell, Target, Calendar } from "lucide-react";

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const goals: Record<string, string> = {
  HYPERTROPHY: "Hipertrofia",
  STRENGTH: "Fuerza",
  ENDURANCE: "Resistencia",
  WEIGHT_LOSS: "Pérdida de peso",
  MAINTENANCE: "Mantenimiento",
  REHABILITATION: "Rehabilitación",
};

export default async function RutinaPage() {
  const member = await getCurrentMember();

  const routine = await prisma.routine.findFirst({
    where: { memberId: member.id, isActive: true },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: [{ dayOfWeek: "asc" }, { order: "asc" }],
      },
    },
  });

  if (!routine) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">🎯 Mi Rutina</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <Dumbbell className="mx-auto text-zinc-600 mb-3" size={40} />
          <p className="text-zinc-400">No tenés una rutina asignada.</p>
          <p className="text-sm text-zinc-600 mt-1">Consultá con tu entrenador.</p>
        </div>
      </div>
    );
  }

  const ejerciciosPorDia = routine.exercises.reduce((acc, ex) => {
    const dia = ex.dayOfWeek;
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(ex);
    return acc;
  }, {} as Record<number, typeof routine.exercises>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">🎯 {routine.name}</h2>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-400">
          <span className="flex items-center gap-1"><Target size={14} /> {goals[routine.goal]}</span>
          <span className="flex items-center gap-1"><Calendar size={14} /> {routine.frequencyPerWeek} días/semana</span>
        </div>
        {routine.notes && <p className="text-sm text-zinc-500 mt-2">{routine.notes}</p>}
      </div>

      <div className="space-y-4">
        {Object.entries(ejerciciosPorDia).map(([dia, ejercicios]) => (
          <div key={dia} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300">
              {diasSemana[Number(dia)]}
            </div>
            <div className="divide-y divide-zinc-800">
              {ejercicios.map((ex) => (
                <div key={ex.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{ex.exercise.name}</p>
                    <p className="text-xs text-zinc-500">{ex.exercise.category} {ex.exercise.equipment && `• ${ex.exercise.equipment}`}</p>
                  </div>
                  <div className="text-right text-sm text-zinc-400">
                    <p>{ex.sets} series x {ex.reps}</p>
                    {ex.weight && <p>{Number(ex.weight)} kg</p>}
                    {ex.restSeconds && <p className="text-xs text-zinc-600">{ex.restSeconds}s descanso</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}