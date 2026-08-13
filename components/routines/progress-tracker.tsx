"use client";

import { useState } from "react";
import { logProgress, deleteProgressLog } from "@/app/actions/routines";
import { Button } from "@/components/ui/button";
import { TrendingUp, ChevronDown } from "lucide-react";
import { ExerciseCardClient } from "./ExerciseCardClient";
import { SetLogger } from "./SetLogger";
import { RestTimer } from "./RestTimer";
import { ProgressChart } from "./progress-chart";
import { Exercise } from "@/types/exercise";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  routineId: string;
  exerciseId: string;
  exercise: Exercise;
  targetSets: number;
  targetReps: string;
  rest?: string;
  notes?: string;
  todayLogs: {
    id: string;
    setsCompleted: number;
    repsCompleted: string;
    weightUsed: number;
    notes: string | null;
    date: string;
  }[];
}

export function ProgressTracker({
  routineId,
  exerciseId,
  exercise,
  targetSets,
  targetReps,
  rest,
  notes,
  todayLogs,
}: ProgressTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const totalSetsToday = todayLogs.reduce((sum, log) => sum + log.setsCompleted, 0);
  const isComplete = totalSetsToday >= targetSets;

  const handleLogSet = async (data: { reps: string; weight: number; notes?: string }) => {
    await logProgress({
      routineId,
      exerciseId,
      setsCompleted: 1,
      repsCompleted: data.reps,
      weightUsed: data.weight,
      notes: data.notes,
    });
  };

  const handleDeleteLog = async (logId: string) => {
    await deleteProgressLog(logId);
  };

  const exerciseHistory = todayLogs.map((log) => ({
    date: log.date,
    weightUsed: log.weightUsed,
    setsCompleted: log.setsCompleted,
    repsCompleted: log.repsCompleted,
  }));

  // Parse rest time for timer
  const restSeconds = rest ? parseInt(rest.match(/\d+/)?.[0] || "60") : 60;

  return (
    <ExerciseCardClient
      exercise={exercise}
      targetSets={targetSets}
      targetReps={targetReps}
      rest={rest}
      notes={notes}
      completedSets={totalSetsToday}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    >
      {/* Timer (solo visible cuando está expandido) */}
      {isExpanded && rest && (
        <div className="mb-3">
          <RestTimer
            defaultSeconds={restSeconds}
            onComplete={() => {}}
          />
        </div>
      )}

      {/* Set Logger */}
      {isExpanded && (
        <SetLogger
          targetSets={targetSets}
          targetReps={targetReps}
          existingLogs={todayLogs}
          onLogSet={handleLogSet}
          onDeleteLog={handleDeleteLog}
        />
      )}

      {/* History & Chart */}
      {isExpanded && todayLogs.length > 0 && (
        <div className="mt-3 space-y-2">
          {/* Toggle history */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground w-full justify-between"
            onClick={() => setShowHistory(!showHistory)}
          >
            <span className="flex items-center gap-1">
              <TrendingUp size={12} />
              Historial y progreso
            </span>
            <ChevronDown
              size={12}
              className={cn("transition-transform", showHistory && "rotate-180")}
            />
          </Button>

          {showHistory && (
            <div className="space-y-3">
              {/* Today's logs summary */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Hoy
                </p>
                {todayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {log.setsCompleted}x{log.repsCompleted}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        @ {log.weightUsed}kg
                      </span>
                      {log.notes && (
                        <span className="text-[10px] text-muted-foreground/60">
                          — {log.notes}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground/40 hover:text-destructive"
                      onClick={() => handleDeleteLog(log.id)}
                    >
                      <span className="text-xs">✕</span>
                    </Button>
                  </div>
                ))}
              </div>

              {/* Chart */}
              {exerciseHistory.length >= 2 && (
                <ProgressChart
                  data={exerciseHistory}
                  exerciseName={exercise.name}
                />
              )}
            </div>
          )}
        </div>
      )}
    </ExerciseCardClient>
  );
}