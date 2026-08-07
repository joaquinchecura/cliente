export const dynamic = "force-dynamic";

import { getProgressHistory } from "@/app/actions/routines";
import { Calendar, TrendingUp, Dumbbell, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function HistorialPage() {
  const logs = await getProgressHistory(30);

  // Agrupar por fecha
  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/rutina" className="text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold">📊 Historial de progreso</h2>
      </div>

      {logs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <TrendingUp className="mx-auto text-zinc-600 mb-3" size={40} />
          <p className="text-zinc-400">Aún no registraste ningún progreso.</p>
          <p className="text-sm text-zinc-600 mt-1">
            Empezá a marcar tus series en tu rutina.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayLogs]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Calendar size={14} />
                <span className="capitalize">{date}</span>
              </div>

              <div className="space-y-2">
                {dayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Dumbbell size={14} className="text-zinc-500" />
                        <p className="font-medium text-white text-sm">
                          {(log as any).exercise?.name || "Ejercicio"}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {(log as any).routine?.name || "Rutina"}
                      </p>
                      {log.notes && (
                        <p className="text-xs text-zinc-600 mt-1">{log.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-medium text-white">
                        {log.setsCompleted}x{log.repsCompleted}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {Number(log.weightUsed)} kg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}