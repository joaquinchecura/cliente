"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2 } from "lucide-react"

export default function MisReservaCancelar({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function cancelar() {
    if (!confirm('¿Cancelar tu reserva para esta clase?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
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

  return (
    <button
      onClick={cancelar}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
      Cancelar
    </button>
  )
}