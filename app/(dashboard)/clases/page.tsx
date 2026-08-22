export const dynamic = 'force-dynamic'

import { getCurrentMember } from "@/lib/member"
import { prisma } from "@/lib/prisma"
import { Calendar, Clock, Users, MapPin, CheckCircle, Dumbbell, TrendingUp } from "lucide-react"
import ReservarClase from "./ReservarClase"
import MisReservaCancelar from "./MisReservaCancelar"

export default async function ClasesPage() {
  const member = await getCurrentMember()

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const proximaSemana = new Date(hoy)
  proximaSemana.setDate(proximaSemana.getDate() + 7)
  proximaSemana.setHours(23, 59, 59, 999)

  const [schedules, misReservas, historial] = await Promise.all([
    prisma.schedule.findMany({
      where: {
        date: { gte: hoy, lte: proximaSemana },
        isCancelled: false,
        isHoliday: false,
        maxCapacity: { gt: 1 },
      },
      include: {
        activity: true,
        bookings: { where: { status: 'CONFIRMED' } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.booking.findMany({
      where: {
        memberId: member.id,
        status: 'CONFIRMED',
        schedule: { date: { gte: hoy } },
      },
      include: { schedule: { include: { activity: true } } },
      orderBy: { schedule: { date: 'asc' } },
    }),
    // Historial para estadística de asistencia propia
    prisma.booking.findMany({
      where: {
        memberId: member.id,
        schedule: { date: { lt: hoy } },
        status: { in: ['COMPLETED', 'NO_SHOW'] },
      },
      select: { status: true },
    }),
  ])

  const completadas = historial.filter(b => b.status === 'COMPLETED').length
  const ausencias = historial.filter(b => b.status === 'NO_SHOW').length
  const totalRelevante = completadas + ausencias
  const tasaAsistencia = totalRelevante > 0 ? Math.round((completadas / totalRelevante) * 100) : null

  const porFecha: Record<string, typeof schedules> = {}
  schedules.forEach((s) => {
    const fecha = s.date.toISOString().split('T')[0]
    if (!porFecha[fecha]) porFecha[fecha] = []
    porFecha[fecha].push(s)
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Clases Grupales</h2>
        <p className="text-zinc-400 mt-1">Reservá tu lugar en las clases del gimnasio</p>
      </div>

      {/* Mi asistencia */}
      {totalRelevante > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={16} className="text-violet-400" />
            </div>
            <p className="text-xl font-bold text-white">{tasaAsistencia}%</p>
            <p className="text-[10px] text-zinc-500 mt-1">Asistencia</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={16} className="text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-white">{completadas}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Clases hechas</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mx-auto mb-2">
              <Users size={16} className="text-red-400" />
            </div>
            <p className="text-xl font-bold text-white">{ausencias}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Ausencias</p>
          </div>
        </div>
      )}

      {/* Mis reservas */}
      {misReservas.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              Mis Clases Reservadas
            </h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {misReservas.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Dumbbell size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{r.schedule.activity.name}</p>
                    <p className="text-sm text-zinc-500">
                    {new Date(r.schedule.date).toLocaleDateString('es-AR', {
  weekday: 'long', day: 'numeric', month: 'long',
  timeZone: 'UTC',
})}
                      {' • '}
                      {r.schedule.startTime} - {r.schedule.endTime}
                    </p>
                  </div>
                </div>
                <MisReservaCancelar bookingId={r.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de clases por fecha */}
      {Object.entries(porFecha).map(([fecha, clases]) => (
        <div key={fecha} className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
  {new Date(fecha + 'T00:00:00Z').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'UTC',
  })}
</h3>
          <div className="space-y-2">
            {clases.map((clase) => {
              const disponibles = clase.maxCapacity - clase.bookings.length
              const miReserva = misReservas.find(r => r.scheduleId === clase.id)

              return (
                <div key={clase.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Clock className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{clase.activity.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {clase.startTime} - {clase.endTime}
                        </span>
                        {clase.room && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {clase.room}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {disponibles} de {clase.maxCapacity} lugares
                        </span>
                      </div>
                    </div>
                  </div>

                  <ReservarClase
                    scheduleId={clase.id}
                    bookingId={miReserva?.id}
                    disponibles={disponibles}
                    yaReservado={!!miReserva}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {schedules.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto mb-3 text-zinc-600" size={48} />
          <p className="text-zinc-500">No hay clases grupales disponibles esta semana</p>
        </div>
      )}
    </div>
  )
}