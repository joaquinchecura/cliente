'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Calendar, QrCode, Bell, Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user } = useUser()
  const [memberName, setMemberName] = useState('')

  useEffect(() => {
    setMemberName(user?.firstName || 'Socio')
  }, [user])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-900">Cultiva</h1>
      </header>

      {/* Contenido */}
      <main className="p-4 space-y-5">
        {/* Saludo */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">¡Hola, {memberName}!</h2>
          <p className="text-slate-500">Listo para entrenar hoy?</p>
        </div>

        {/* Próxima clase */}
        <div className="bg-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} />
            <span className="text-sm font-medium opacity-90">Próxima clase</span>
          </div>
          <div>
            <h3 className="text-lg font-bold">No tenés clases reservadas</h3>
            <Link href="/turnos"
              className="inline-block mt-3 text-sm bg-white text-blue-600 px-4 py-2 rounded-lg font-medium">
              Reservar turno
            </Link>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/turnos"
            className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:border-blue-300 transition">
            <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
            <span className="text-sm font-medium text-slate-700">Reservar</span>
          </Link>
          <Link href="/rutina"
            className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:border-blue-300 transition">
            <Dumbbell className="mx-auto mb-2 text-blue-600" size={24} />
            <span className="text-sm font-medium text-slate-700">Rutina</span>
          </Link>
          <Link href="/perfil"
            className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:border-blue-300 transition">
            <QrCode className="mx-auto mb-2 text-blue-600" size={24} />
            <span className="text-sm font-medium text-slate-700">Mi QR</span>
          </Link>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <Bell className="mx-auto mb-2 text-slate-400" size={24} />
            <span className="text-sm font-medium text-slate-500">Notificaciones</span>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around">
        <Link href="/home" className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-blue-600">
          <Calendar size={20} />
          <span className="text-xs">Inicio</span>
        </Link>
        <Link href="/turnos" className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-slate-400">
          <Calendar size={20} />
          <span className="text-xs">Turnos</span>
        </Link>
        <Link href="/rutina" className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-slate-400">
          <Dumbbell size={20} />
          <span className="text-xs">Rutina</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-slate-400">
          <QrCode size={20} />
          <span className="text-xs">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}