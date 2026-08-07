"use client";

import { useState } from "react";
import { logProgress, deleteProgressLog } from "@/app/actions/routines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Trash2, Plus, Minus } from "lucide-react";

interface ProgressTrackerProps {
  routineId: string;
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  todayLogs: {
    id: string;
    setsCompleted: number;
    repsCompleted: string;
    weightUsed: number;
    notes: string | null;
  }[];
}

export function ProgressTracker({
  routineId,
  exerciseId,
  exerciseName,
  targetSets,
  targetReps,
  todayLogs,
}: ProgressTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sets, setSets] = useState(targetSets);
  const [reps, setReps] = useState(targetReps);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const totalSetsToday = todayLogs.reduce((sum, log) => sum + log.setsCompleted, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) return;

    setSaving(true);
    try {
      await logProgress({
        routineId,
        exerciseId,
        setsCompleted: sets,
        repsCompleted: reps,
        weightUsed: parseFloat(weight),
        notes: notes || undefined,
      });
      setWeight("");
      setNotes("");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el progreso");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Resumen de hoy */}
      {todayLogs.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-sinc-500 font-medium">Hoy: {totalSetsToday} series completadas</p>
          {todayLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between bg-slate-50 rounded px-2 py-1 text-xs"
            >
              <span className="text-slate-600">
                {log.setsCompleted}x{log.repsCompleted} @ {log.weightUsed}kg
                {log.notes && ` — ${log.notes}`}
              </span>
              <form action={() => deleteProgressLog(log.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={10} />
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Botón para agregar */}
      {!isOpen ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1 text-xs h-7"
          onClick={() => setIsOpen(true)}
        >
          <Plus size={12} /> Registrar serie
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2 bg-slate-50 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500">Series</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSets(Math.max(1, sets - 1))}
                >
                  <Minus size={10} />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{sets}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSets(sets + 1)}
                >
                  <Plus size={10} />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500">Reps</Label>
              <Input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="h-7 text-sm bg-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500">Peso (kg)</Label>
              <Input
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0"
                className="h-7 text-sm bg-white"
                required
              />
            </div>
          </div>

          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas (opcional)"
            className="h-7 text-xs bg-white"
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              className="flex-1 h-7 text-xs gap-1"
              disabled={saving}
            >
              <CheckCircle size={12} />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}