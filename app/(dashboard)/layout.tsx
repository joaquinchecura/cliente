import Link from "next/link";
import { 
  Home, Calendar, Dumbbell, TrendingUp, 
  QrCode, CreditCard, Newspaper, User 
} from "lucide-react";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";

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
              <h1 className="text-lg font-bold text-white leading-tight">Cultiva Fitness</h1>
              <p className="text-xs text-zinc-500">CLIENTE</p>
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
          <UserMenu />
        </div>
      </aside>

      {/* Mobile Header + Menu */}
      <MobileMenu />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}