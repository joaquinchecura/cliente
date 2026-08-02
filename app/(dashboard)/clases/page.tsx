export const dynamic = 'force-dynamic';

import { getCurrentMember } from "@/lib/member";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, Users, MapPin, CheckCircle, Dumbbell } from "lucide-react";
import ReservarClase from "./ReservarClase";

export default async function ClasesPage() {
  const member = await getCurrentMember();

  // Clases disponibles para hoy y próximos 7 días
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximaSemana = new Date(hoy);
  proximaSemana.setDate(proximaSemana.getDate() + 7);
  proximaSemana.setHours(23, 59, 59, 999);

  const schedules = await prisma.schedule.findMany({
    where: {
      date: { gte: hoy, lte: proximaSemana },
      isCancelled: false,
      isHoliday: false,
      maxCapacity: { gt: 1 }, // Solo grupales
    },
    include: {
      activity: true,
      bookings: { where: { status: 'CONFIRMED' } },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  // Mis reservas confirmadas (grupales + personales)
  const misReservas = await prisma.booking.findMany({
    where: {
      memberId: member.id,
      status: 'CONFIRMED',
      schedule: { date: { gte: hoy } },
    },
    include: { schedule: { include: { activity: true } } },
    orderBy: { schedule: { date: 'asc' } },
  });

  // Agrupar por fecha
  const porFecha: Record<string, typeof schedules> = {};
  schedules.forEach((s) => {
    const fecha = s.date.toISOString().split('T')[0];
    if (!porFecha[fecha]) porFecha[fecha] = [];
    porFecha[fecha].push(s);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Clases Grupales</h2>
        <p className="text-zinc-400 mt-1">Reservá tu lugar en las clases del gimnasio</p>
      </div>

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
                      {new Date(r.schedule.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {' • '}
                      {r.schedule.startTime} - {r.schedule.endTime}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">
                  Confirmada
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de clases por fecha */}
      {Object.entries(porFecha).map(([fecha, clases]) => (
        <div key={fecha} className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            {new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          
          <div className="space-y-2">
            {clases.map((clase) => {
              const disponibles = clase.maxCapacity - clase.bookings.length;
              const yaReservado = misReservas.some(r => r.scheduleId === clase.id);
              
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
                    disponibles={disponibles} 
                    yaReservado={yaReservado}
                  />
                </div>
              );
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
  );
}