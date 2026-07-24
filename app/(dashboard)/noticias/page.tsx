import { prisma } from "@/lib/prisma";
import { Newspaper } from "lucide-react";
import Image from "next/image";

export default async function NoticiasPage() {
  const news = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📰 Novedades</h2>

      {news.length === 0 ? (
        <p className="text-zinc-600 text-sm">No hay novedades por el momento.</p>
      ) : (
        <div className="space-y-4">
          {news.map((n) => (
            <article key={n.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {n.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image src={n.imageUrl} alt={n.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white">{n.title}</h3>
                <p className="text-zinc-400 mt-2 whitespace-pre-line">{n.content}</p>
                <p className="text-xs text-zinc-600 mt-3">{new Date(n.createdAt).toLocaleDateString("es-AR")}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}