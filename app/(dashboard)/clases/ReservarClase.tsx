"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Users, X } from "lucide-react"

interface Props {
  scheduleId: string
  bookingId?: string      // ← nuevo: id de la reserva, si ya existe
  disponibles: number
  yaReservado: boolean
}

export default function ReservarClase({ scheduleId, bookingId, disponibles, yaReservado }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [reservado, setReservado] = useState(yaReservado)
  const [currentBookingId, setCurrentBookingId] = useState(bookingId)

  async function reservar() {
    if (disponibles <= 0 || reservado) return
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      })
      const data = await res.json()
      if (res.ok) {
        setReservado(true)
        setCurrentBookingId(data.id)
        router.refresh()
      } else {
        alert(data.error || 'Error al reservar')
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function cancelar() {
    if (!currentBookingId) return
    if (!confirm('¿Cancelar tu reserva para esta clase?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${currentBookingId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setReservado(false)
        setCurrentBookingId(undefined)
        router.refresh()
      } else {
        alert(data.error || 'Error al cancelar')
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (reservado) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-green-400 text-sm bg-green-500/10 px-3 py-2 rounded-lg">
          <Check size={16} />
          Reservado
        </span>
        <button
          onClick={cancelar}
          disabled={loading}
          className="flex items-center gap-1 text-red-400 text-xs hover:text-red-300 disabled:opacity-50 transition-colors px-2 py-2"
          title="Cancelar reserva"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
        </button>
      </div>
    )
  }

  if (disponibles <= 0) {
    return (
      <span className="text-sm text-zinc-500 bg-zinc-800 px-3 py-2 rounded-lg">
        <Users size={14} className="inline mr-1" />
        Completo
      </span>
    )
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
  )
}