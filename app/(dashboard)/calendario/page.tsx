'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin,
  Dumbbell, UserCircle2, CheckCircle, XCircle, UserX, Loader2,
} from 'lucide-react'

interface Session {
  id: string
  status: 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'
  date: string // YYYY-MM-DD
  startTime: string
  endTime: string
  room: string | null
  activityName: string
  activityType: 'GROUP' | 'PERSONAL'
  isCancelledSchedule: boolean
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const STATUS_CONFIG: Record<Session['status'], { label: string; badge: string; icon: any; dot: string }> = {
  CONFIRMED: { label: 'Reservada', badge: 'bg-blue-500/10 text-blue-400', icon: CalendarIcon, dot: 'bg-blue-500' },
  COMPLETED: { label: 'Realizada', badge: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle, dot: 'bg-emerald-500' },
  NO_SHOW:   { label: 'Ausente', badge: 'bg-amber-500/10 text-amber-400', icon: UserX, dot: 'bg-amber-500' },
  CANCELLED: { label: 'Cancelada', badge: 'bg-red-500/10 text-red-400', icon: XCircle, dot: 'bg-zinc-600' },
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function CalendarioPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-12
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const fetchSessions = useCallback(async (y: number, m: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/calendario?year=${y}&month=${m}`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions(year, month)
    setSelectedDate(null)
  }, [year, month, fetchSessions])

  function goToMonth(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth > 12) { newMonth = 1; newYear++ }
    if (newMonth < 1) { newMonth = 12; newYear-- }
    setMonth(newMonth)
    setYear(newYear)
  }

  function goToToday() {
    setYear(now.getFullYear())
    setMonth(now.getMonth() + 1)
  }

  // Agrupar sesiones por fecha
  const sessionsByDate: Record<string, Session[]> = {}
  sessions.forEach(s => {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = []
    sessionsByDate[s.date].push(s)
  })

  // Construir grilla del mes (semanas empezando en lunes)
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1))
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7 // 0 = lunes

  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  function dateKey(day: number) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function dayColor(daySessions: Session[]) {
    if (daySessions.length === 0) return null
    // Prioridad visual: si hay alguna completada, verde. Si no, si hay alguna reservada, azul. Si no, el resto (cancelada/ausente).
    if (daySessions.some(s => s.status === 'COMPLETED')) return STATUS_CONFIG.COMPLETED.dot
    if (daySessions.some(s => s.status === 'CONFIRMED')) return STATUS_CONFIG.CONFIRMED.dot
    if (daySessions.some(s => s.status === 'NO_SHOW')) return STATUS_CONFIG.NO_SHOW.dot
    return STATUS_CONFIG.CANCELLED.dot
  }

  const selectedSessions = selectedDate ? (sessionsByDate[selectedDate] || []) : []
  const today = todayISO()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Mi Calendario</h2>
        <p className="text-zinc-400 mt-1">Clases grupales y sesiones de Personal Trainer</p>
      </div>

      {/* Navegación del mes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => goToMonth(-1)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-white font-semibold">{MESES[month - 1]} {year}</p>
            <button onClick={goToToday} className="text-xs text-blue-400 hover:text-blue-300 mt-0.5">
              Ir a hoy
            </button>
          </div>
          <button
            onClick={() => goToMonth(1)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-zinc-600" />
          </div>
        ) : (
          <>
            {/* Encabezado días de semana */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DIAS.map(d => (
                <div key={d} className="text-center text-[10px] font-medium text-zinc-500 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grilla de días */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />
                const key = dateKey(day)
                const daySessions = sessionsByDate[key] || []
                const color = dayColor(daySessions)
                const isToday = key === today
                const isSelected = key === selectedDate

                return (
                  <button
                    key={key}
                    onClick={() => daySessions.length > 0 && setSelectedDate(isSelected ? null : key)}
                    disabled={daySessions.length === 0}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 text-sm transition-all
                      ${isSelected ? 'bg-zinc-700 ring-1 ring-zinc-500' : daySessions.length > 0 ? 'hover:bg-zinc-800' : ''}
                      ${isToday ? 'ring-1 ring-blue-500/50' : ''}
                    `}
                  >
                    <span className={daySessions.length > 0 ? 'text-white font-medium' : 'text-zinc-600'}>
                      {day}
                    </span>
                    {color && <span className={`w-1.5 h-1.5 rounded-full ${color}`} />}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Leyenda */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Reservada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Realizada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Ausente
          </span>
        </div>
      </div>

      {/* Detalle del día seleccionado */}
      {selectedDate && selectedSessions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
            })}
          </h3>
          {selectedSessions.map(s => {
            const cfg = STATUS_CONFIG[s.status]
            const TypeIcon = s.activityType === 'PERSONAL' ? UserCircle2 : Dumbbell
            return (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.activityType === 'PERSONAL' ? 'bg-violet-500/10' : 'bg-blue-500/10'}`}>
                    <TypeIcon size={16} className={s.activityType === 'PERSONAL' ? 'text-violet-400' : 'text-blue-400'} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{s.activityName}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                      </span>
                      {s.room && (
                        <span className="flex items-center gap-1"><MapPin size={11} /> {s.room}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${cfg.badge}`}>
                  <cfg.icon size={12} /> {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto mb-3 text-zinc-600" size={40} />
          <p className="text-zinc-500">Sin actividad registrada este mes</p>
        </div>
      )}
    </div>
  )
}