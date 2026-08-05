export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { Newspaper, Calendar } from "lucide-react"

export default async function NoticiasPage() {
  const news = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Noticias</h2>
        <p className="text-zinc-400 mt-1">Novedades del gimnasio</p>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Newspaper size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Calendar size={12} />
                  {new Date(item.createdAt).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {item.content}
            </p>
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="mt-4 rounded-xl max-h-64 w-full object-cover"
              />
            )}
          </div>
        ))}

        {news.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="mx-auto mb-3 text-zinc-600" size={48} />
            <p className="text-zinc-500">No hay noticias por ahora</p>
          </div>
        )}
      </div>
    </div>
  )
}