// app/(dashboard)/layout.tsx
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { 
  Home, Calendar, Dumbbell, TrendingUp, 
  QrCode, CreditCard, Newspaper, User,
  Menu, X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/clases", label: "Clases", icon: Calendar },
  { href: "/rutina", label: "Mi Rutina", icon: Dumbbell },
  { href: "/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/asistencias", label: "Asistencias", icon: QrCode },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 hidden md:flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Cultiva</h1>
              <p className="text-xs text-zinc-500">Tu Gimnasio</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-200 group"
            >
              <item.icon size={18} className="group-hover:text-blue-400 transition-colors" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/sign-in" />
            <span className="text-sm text-zinc-400">Mi Cuenta</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-zinc-900 border-b border-zinc-800 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <h1 className="font-bold text-white">Cultiva</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-zinc-950 z-40 pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
              >
                <item.icon size={20} />
                <span className="text-base">{item.label}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-zinc-800 mt-4">
              <div className="px-4 py-2">
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}