export const dynamic = "force-dynamic";

import { getProgressHistory } from "@/app/actions/routines";
import { Calendar, TrendingUp, ArrowLeft, Trophy, Flame, Dumbbell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function HistorialPage() {
  const logs = await getProgressHistory(30);

  // ✅ CONVERTIR Decimal a number
  const normalizedLogs = logs.map((log) => ({
    ...log,
    weightUsed: Number(log.weightUsed),
  }));

  // Agrupar por fecha
  const grouped = normalizedLogs.reduce((acc, log) => {
    const date = new Date(log.date);
    const dateKey = date.toISOString().split("T")[0];
    const dateLabel = date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[dateKey]) {
      acc[dateKey] = { label: dateLabel, logs: [] as typeof normalizedLogs };
    }
    acc[dateKey].logs.push(log);
    return acc;
  }, {} as Record<string, { label: string; logs: typeof normalizedLogs }>);

  // Calcular stats
  const totalSets = normalizedLogs.reduce((sum, log) => sum + log.setsCompleted, 0);
  const totalWeight = normalizedLogs.reduce(
    (sum, log) => sum + log.weightUsed * log.setsCompleted,
    0
  );
  const uniqueExercises = new Set(normalizedLogs.map((l) => l.exerciseId)).size;
  const uniqueDays = Object.keys(grouped).length;

  // Encontrar PRs (máximo peso por ejercicio)
  const prs = normalizedLogs.reduce((acc, log) => {
    const current = acc.get(log.exerciseId);
    if (!current || log.weightUsed > current.weight) {
      acc.set(log.exerciseId, { weight: log.weightUsed, date: log.date });
    }
    return acc;
  }, new Map<string, { weight: number; date: Date }>());

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/rutina">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">📊 Historial</h1>
          <p className="text-xs text-muted-foreground">Últimos 30 días</p>
        </div>
      </div>

      {normalizedLogs.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <TrendingUp className="text-muted-foreground/30" size={28} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Sin registros aún
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Empezá a marcar tus series en tu rutina para ver tu progreso acá.
          </p>
          <Link href="/rutina" className="mt-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Dumbbell size={14} />
              Ir a mi rutina
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3 text-center border-border/60">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Dumbbell size={16} className="text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{totalSets}</p>
              <p className="text-[10px] text-muted-foreground">Series totales</p>
            </Card>
            <Card className="p-3 text-center border-border/60">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <Flame size={16} className="text-amber-500" />
              </div>
              <p className="text-xl font-bold text-foreground">{Math.round(totalWeight)}</p>
              <p className="text-[10px] text-muted-foreground">Volumen (kg)</p>
            </Card>
            <Card className="p-3 text-center border-border/60">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <Calendar size={16} className="text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-foreground">{uniqueDays}</p>
              <p className="text-[10px] text-muted-foreground">Días activos</p>
            </Card>
            <Card className="p-3 text-center border-border/60">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mx-auto mb-2">
                <Trophy size={16} className="text-violet-500" />
              </div>
              <p className="text-xl font-bold text-foreground">{uniqueExercises}</p>
              <p className="text-[10px] text-muted-foreground">Ejercicios</p>
            </Card>
          </div>

          {/* PRs section */}
          {prs.size > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                🏆 Records personales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from(prs.entries()).slice(0, 4).map(([exerciseId, pr]) => (
                  <Card
                    key={exerciseId}
                    className="p-3 border-amber-500/20 bg-amber-500/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Trophy size={14} className="text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {exerciseId.slice(0, 8)}...
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {pr.weight} kg • {new Date(pr.date).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              📅 Timeline
            </h3>

            {Object.entries(grouped).map(([dateKey, { label, logs: dayLogs }]) => {
              const daySets = dayLogs.reduce((sum, log) => sum + log.setsCompleted, 0);
              const dayVolume = dayLogs.reduce(
                (sum, log) => sum + log.weightUsed * log.setsCompleted,
                0
              );

              return (
                <div key={dateKey} className="space-y-3">
                  {/* Date header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar size={14} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">
                          {label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {daySets} series • {Math.round(dayVolume)} kg de volumen
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {dayLogs.length} registros
                    </Badge>
                  </div>

                  {/* Logs del día */}
                  <div className="space-y-2 pl-10">
                    {dayLogs.map((log) => {
                      const prWeight = prs.get(log.exerciseId)?.weight || 0;
                      const isPR = log.weightUsed >= prWeight && prWeight > 0;

                      return (
                        <Card
                          key={log.id}
                          className="p-3 border-border/40 hover:border-border/80 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                  isPR ? "bg-amber-500/10" : "bg-muted"
                                )}
                              >
                                <Dumbbell
                                  size={14}
                                  className={cn(
                                    isPR ? "text-amber-500" : "text-muted-foreground"
                                  )}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {log.setsCompleted}x{log.repsCompleted}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(log.date).toLocaleTimeString("es-AR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {log.notes && ` • ${log.notes}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">
                                {log.weightUsed} kg
                              </p>
                              {isPR && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] border-amber-500/30 text-amber-500 bg-amber-500/5"
                                >
                                  PR 🏆
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}