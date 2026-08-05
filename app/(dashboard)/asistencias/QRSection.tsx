// app/(dashboard)/asistencias/QRSection.tsx
'use client'

import { useState } from 'react'
import { QrCode, ChevronDown, ChevronUp } from 'lucide-react'
import QRDisplay from './QRDisplay'

interface Props {
  memberId: string
  memberName: string
  dni: string
  status: string
}

export default function QRSection({ memberId, memberName, dni, status }: Props) {
  const [showQR, setShowQR] = useState(false)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setShowQR(!showQR)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <QrCode size={18} className="text-blue-400" />
          </div>
          <div>
            <span className="font-semibold text-white block">QR de Acceso</span>
            <span className="text-xs text-zinc-500">
              {showQR ? 'Mostrando QR...' : 'Tocá para mostrar tu QR de ingreso'}
            </span>
          </div>
        </div>
        {showQR ? (
          <ChevronUp size={20} className="text-zinc-500" />
        ) : (
          <ChevronDown size={20} className="text-zinc-500" />
        )}
      </button>

      {showQR && (
        <div className="p-5 border-t border-zinc-800">
          <QRDisplay 
            memberId={memberId} 
            memberName={memberName} 
            dni={dni} 
            status={status} 
          />
        </div>
      )}
    </div>
  )
}