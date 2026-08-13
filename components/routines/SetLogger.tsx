"use client";

import { useState } from "react";
import { Check, Trash2, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SetData {
  id: string;
  setNumber: number;
  reps: string;
  weight: number;
  completed: boolean;
  notes?: string;
}

interface SetLoggerProps {
  targetSets: number;
  targetReps: string;
  existingLogs: {
    id: string;
    setsCompleted: number;
    repsCompleted: string;
    weightUsed: number;
    notes: string | null;
  }[];
  onLogSet: (data: { reps: string; weight: number; notes?: string }) => Promise<void>;
  onDeleteLog: (logId: string) => Promise<void>;
}

export function SetLogger({
  targetSets,
  targetReps,
  existingLogs,
  onLogSet,
  onDeleteLog,
}: SetLoggerProps) {
  const [sets, setSets] = useState<SetData[]>(() => {
    // Convert existing logs to set format
    const initialSets: SetData[] = [];
    existingLogs.forEach((log) => {
      for (let i = 0; i < log.setsCompleted; i++) {
        initialSets.push({
          id: `${log.id}-${i}`,
          setNumber: initialSets.length + 1,
          reps: log.repsCompleted,
          weight: log.weightUsed,
          completed: true,
          notes: log.notes || undefined,
        });
      }
    });
    // Fill remaining target sets
    while (initialSets.length < targetSets) {
      initialSets.push({
        id: `pending-${initialSets.length}`,
        setNumber: initialSets.length + 1,
        reps: targetReps,
        weight: initialSets.length > 0 ? initialSets[initialSets.length - 1].weight : 0,
        completed: false,
      });
    }
    return initialSets;
  });

  const [activeSetIndex, setActiveSetIndex] = useState(() => {
    const firstIncomplete = sets.findIndex((s) => !s.completed);
    return firstIncomplete >= 0 ? firstIncomplete : sets.length;
  });

  const [saving, setSaving] = useState(false);

  const handleCompleteSet = async (index: number) => {
    const set = sets[index];
    if (set.weight <= 0) return;

    setSaving(true);
    try {
      await onLogSet({
        reps: set.reps,
        weight: set.weight,
        notes: set.notes,
      });

      const newSets = [...sets];
      newSets[index] = { ...set, completed: true };
      setSets(newSets);

      // Move to next set
      const nextIncomplete = newSets.findIndex((s, i) => i > index && !s.completed);
      if (nextIncomplete >= 0) {
        setActiveSetIndex(nextIncomplete);
      } else if (newSets.length < targetSets + 2) {
        // Add extra set option
        newSets.push({
          id: `extra-${newSets.length}`,
          setNumber: newSets.length + 1,
          reps: set.reps,
          weight: set.weight,
          completed: false,
        });
        setSets(newSets);
        setActiveSetIndex(newSets.length - 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSet = (index: number, field: keyof SetData, value: any) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const completedCount = sets.filter((s) => s.completed).length;
  const isAllComplete = completedCount >= targetSets;

  return (
    <div className="space-y-2">
      {/* Sets grid */}
      <div className="grid grid-cols-1 gap-1.5">
        {sets.map((set, index) => (
          <div
            key={set.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
              set.completed
                ? "bg-emerald-500/5 border border-emerald-500/10"
                : index === activeSetIndex
                ? "bg-primary/5 border border-primary/20 ring-1 ring-primary/10"
                : "bg-muted/30 border border-transparent"
            )}
          >
            {/* Set number / check */}
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                set.completed
                  ? "bg-emerald-500 text-white"
                  : index === activeSetIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {set.completed ? <Check size={14} /> : set.setNumber}
            </div>

            {/* Reps input */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Input
                  type="text"
                  value={set.reps}
                  onChange={(e) => handleUpdateSet(index, "reps", e.target.value)}
                  disabled={set.completed}
                  className={cn(
                    "h-7 text-xs text-center w-14",
                    set.completed && "opacity-50"
                  )}
                  placeholder="Reps"
                />
                <span className="text-[10px] text-muted-foreground">reps</span>

                <Dumbbell size={10} className="text-muted-foreground/40 ml-1" />

                <Input
                  type="number"
                  step="0.5"
                  value={set.weight || ""}
                  onChange={(e) =>
                    handleUpdateSet(index, "weight", parseFloat(e.target.value) || 0)
                  }
                  disabled={set.completed}
                  className={cn(
                    "h-7 text-xs text-center w-16",
                    set.completed && "opacity-50"
                  )}
                  placeholder="Peso"
                />
                <span className="text-[10px] text-muted-foreground">kg</span>
              </div>
            </div>

            {/* Notes */}
            {!set.completed && index === activeSetIndex && (
              <Input
                type="text"
                value={set.notes || ""}
                onChange={(e) => handleUpdateSet(index, "notes", e.target.value)}
                className="h-7 text-[10px] w-24 hidden sm:block"
                placeholder="Nota..."
              />
            )}

            {/* Action */}
            {set.completed ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground/40 hover:text-destructive"
                onClick={() => {
                  // Find and delete the corresponding log
                  const logIndex = Math.floor(index / (existingLogs[0]?.setsCompleted || 1));
                  if (existingLogs[logIndex]) {
                    onDeleteLog(existingLogs[logIndex].id);
                  }
                }}
              >
                <Trash2 size={10} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-[10px] font-medium",
                  index === activeSetIndex
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleCompleteSet(index)}
                disabled={saving || set.weight <= 0}
              >
                {saving ? "..." : "OK"}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {completedCount > 0 && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
          <span>
            {completedCount} de {targetSets} series completadas
          </span>
          {isAllComplete && (
            <span className="text-emerald-400 font-medium">¡Ejercicio completado! 🎉</span>
          )}
        </div>
      )}
    </div>
  );
}