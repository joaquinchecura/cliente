"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  defaultSeconds?: number;
  onComplete?: () => void;
}

export function RestTimer({ defaultSeconds = 60, onComplete }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parseRestTime = (rest: string): number => {
    const match = rest.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60;
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      // Fallback: no sound
    }
  }, [soundEnabled]);

  const start = () => {
    setIsRunning(true);
    setIsComplete(false);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setSeconds(defaultSeconds);
    setIsComplete(false);
  };

  const adjustTime = (delta: number) => {
    setSeconds((prev) => Math.max(5, prev + delta));
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            playBeep();
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete, playBeep]);

  const progress = ((defaultSeconds - seconds) / defaultSeconds) * 100;

  return (
    <div className={cn(
      "rounded-xl p-3 transition-all duration-300",
      isComplete
        ? "bg-emerald-500/10 border border-emerald-500/20"
        : isRunning
        ? "bg-primary/5 border border-primary/20"
        : "bg-muted/50 border border-border/50"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Circular progress */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/30"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-1000",
                  isComplete ? "text-emerald-500" : "text-primary"
                )}
              />
            </svg>
            <span className={cn(
              "absolute inset-0 flex items-center justify-center text-[10px] font-bold",
              isComplete ? "text-emerald-400" : "text-foreground"
            )}>
              {formatTime(seconds)}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground">Descanso</p>
            <p className="text-[10px] text-muted-foreground">
              {isComplete ? "¡Listo!" : isRunning ? "En curso..." : "Pausado"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isRunning && seconds > 0 && !isComplete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
              onClick={start}
            >
              <Play size={14} />
            </Button>
          )}

          {isRunning && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-primary/10"
              onClick={pause}
            >
              <Pause size={14} />
            </Button>
          )}

          {(isComplete || seconds === 0) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10"
              onClick={reset}
            >
              <RotateCcw size={14} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </Button>
        </div>
      </div>

      {/* Quick adjust buttons */}
      <div className="flex items-center gap-1 mt-2">
        {[-30, -15, -5, +5, +15, +30].map((delta) => (
          <Button
            key={delta}
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => adjustTime(delta)}
          >
            {delta > 0 ? `+${delta}s` : `${delta}s`}
          </Button>
        ))}
      </div>
    </div>
  );
}