export default function RegistroInvalidoPage() {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md text-center space-y-3">
          <h1 className="text-xl font-bold text-white">Link inválido</h1>
          <p className="text-sm text-zinc-400">
            Este link de registro no es válido o ya no está disponible. Pedile a tu entrenador que te comparta el link actualizado.
          </p>
        </div>
      </div>
    )
  }