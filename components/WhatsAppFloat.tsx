'use client'

import { MessageCircle } from 'lucide-react'

// TODO: reemplazar por el número real del gimnasio, formato internacional sin +
const WHATSAPP_NUMBER = '5491100000000'
const DEFAULT_MESSAGE = 'Hola! Te escribo desde la app de Cultiva Fitness'

export default function WhatsAppFloat() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg shadow-black/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={26} className="text-white" fill="white" strokeWidth={0} />
    </a>
  )
}