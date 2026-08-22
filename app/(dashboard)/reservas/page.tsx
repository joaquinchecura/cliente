export const dynamic = 'force-dynamic'

import { getMyPTSessions } from '@/app/actions/pt-sessions'
import {
  Dumbbell, Clock, MapPin, CheckCircle, XCircle,
  UserX, Package, Calendar,
} from 'lucide-react'

const TZ = 'America/Argentina/Buenos_Aires'

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: any }> = {
  CONFIRMED: { label: 'Confirmada', badge: 'bg-blue-500/10 text-blue-400',   icon: Calendar },
  COMPLETED: { label: 'Realizada',  badge: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle },
  NO_SHOW:   { label: 'Ausente',    badge: 'bg-amber-500/10 text-amber-400',  icon: UserX },
  CANCELLED: { label: 'Cancelada',  badge: 'bg-red-500/10 text-red-400',      icon: XCircle },
}

export default async function ReservasPage() {
  const { upcoming, past, packageInfo } = await getMyPTSessions()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Reservas</h2>
        <p className="text-zinc-400 mt-1">Tus sesiones de entrenamiento personal</p>
      </div>

      {/* Paquete activo */}
      {packageInfo && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Package size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{packageInfo.planName}</p>
              <p className="text-xs text-zinc-500">
                Vence {new Date(packageInfo.expiresAt).toLocaleDateString('es-AR', { timeZone: TZ })}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-zinc-400">Sesiones restantes</span>
            <span className="text-white font-bold">{packageInfo.remaining} / {packageInfo.total}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: `${(packageInfo.remaining / (packageInfo.total || 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Próximas sesiones */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Próximas sesiones
        </h3>
        {upcoming.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <Dumbbell className="mx-auto mb-2 text-zinc-600" size={32} />
            <p className="text-zinc-500 text-sm">Sin sesiones próximas</p>
            <p className="text-zinc-600 text-xs mt-1">Coordiná con tu entrenador para reservar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(b => {
              const cfg = STATUS_CONFIG[b.status]
              return (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Dumbbell size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{b.schedule.activity.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(b.schedule.date).toLocaleDateString('es-AR', {
                            weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {b.schedule.startTime.slice(0,5)} - {b.schedule.endTime.slice(0,5)}
                        </span>
                        {b.schedule.room && (
                          <span className="flex items-center gap-1"><MapPin size={11} /> {b.schedule.room}</span>
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
      </div>

      {/* Historial */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Historial
          </h3>
          <div className="space-y-2">
            {past.slice(0, 15).map(b => {
              const cfg = STATUS_CONFIG[b.status]
              return (
                <div key={b.id} className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-300">{b.schedule.activity.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {new Date(b.schedule.date).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    <cfg.icon size={10} /> {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}