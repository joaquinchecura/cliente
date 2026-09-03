"use client";

import { useState } from "react";
import { Play, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseMediaProps {
  imageUrl?: string | null;
  gifUrl?: string | null;
  videoUrl?: string | null;
  name: string;
  className?: string;
}

export function ExerciseMedia({ imageUrl, gifUrl, videoUrl, name, className }: ExerciseMediaProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const hasMedia = imageUrl || gifUrl || videoUrl;

  // Contenedor base: relación 4:3 fija (las imágenes son 1200x896).
  // object-contain asegura que la imagen se vea completa siempre,
  // sin recortes, aunque queden pequeñas franjas vacías arriba/abajo.
  const baseContainer = "relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-muted";

  if (!hasMedia || mediaError) {
    return (
      <div className={cn(baseContainer, "flex items-center justify-center", className)}>
        <Dumbbell className="h-8 w-8 text-muted-foreground/50" />
      </div>
    );
  }

  if (gifUrl) {
    return (
      <div
        className={cn(baseContainer, className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={isHovered ? gifUrl : (imageUrl || gifUrl)}
          alt={name}
          className="h-full w-full object-contain transition-all duration-300"
          onError={() => setMediaError(true)}
        />
        {!isHovered && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">GIF</span>
          </div>
        )}
      </div>
    );
  }

  if (videoUrl) {
    return (
      <div className={cn(baseContainer, "group", className)}>
        <img
          src={imageUrl || ""}
          alt={name}
          className="h-full w-full object-contain"
          onError={() => setMediaError(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-2">
            <Play className="h-5 w-5 text-primary fill-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(baseContainer, className)}>
      <img
        src={imageUrl!}
        alt={name}
        className="h-full w-full object-contain"
        onError={() => setMediaError(true)}
      />
    </div>
  );
}