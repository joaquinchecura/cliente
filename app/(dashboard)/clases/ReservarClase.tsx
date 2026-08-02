"use client";

import { useState } from "react";
import { Check, Loader2, Users } from "lucide-react";

interface Props {
  scheduleId: string;
  disponibles: number;
  yaReservado: boolean;
}

export default function ReservarClase({ scheduleId, disponibles, yaReservado }: Props) {
  const [loading, setLoading] = useState(false);
  const [reservado, setReservado] = useState(yaReservado);

  async function reservar() {
    if (disponibles <= 0 || reservado) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      });

      if (res.ok) {
        setReservado(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al reservar');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  if (reservado) {
    return (
      <span className="flex items-center gap-1.5 text-green-400 text-sm bg-green-500/10 px-3 py-2 rounded-lg">
        <Check size={16} />
        Reservado
      </span>
    );
  }

  if (disponibles <= 0) {
    return (
      <span className="text-sm text-zinc-500 bg-zinc-800 px-3 py-2 rounded-lg">
        <Users size={14} className="inline mr-1" />
        Completo
      </span>
    );
  }

  return (
    <button
      onClick={reservar}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      Reservar
    </button>
  );
}