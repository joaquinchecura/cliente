import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { 
  Home, Calendar, Dumbbell, TrendingUp, 
  QrCode, CreditCard, Newspaper, User 
} from "lucide-react";

const nav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/clases", label: "Clases", icon: Calendar },
  { href: "/rutina", label: "Mi Rutina", icon: Dumbbell },
  { href: "/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/asistencias", label: "Asistencias", icon: QrCode },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 hidden md:flex flex-col fixed h-full">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-white tracking-tight">💪 Tu Gimnasio</h1>
          <p className="text-xs text-zinc-500 mt-1">Área del Alumno</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-zinc-900 border-b border-zinc-800 z-50 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold">💪 Tu Gimnasio</h1>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
}