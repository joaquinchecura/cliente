"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Home, Calendar, Dumbbell, TrendingUp, History,
  QrCode, CreditCard, Newspaper, User, CalendarCheck, UserCircle2,
  Menu, X 
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/clases", label: "Clases", icon: Calendar },
  { href: "/personaltrainer", label: "Personal Trainer", icon: UserCircle2 },
  { href: "/calendario", label: "Mi Calendario", icon: CalendarCheck },
  { href: "/rutina", label: "Mi Rutina", icon: Dumbbell },
  { href: "/rutina/historial", label: "Historial de rutina", icon: History },
  { href: "/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/asistencias", label: "Asistencias", icon: QrCode },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function MobileMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </div>
          <h1 className="font-bold text-foreground">Cultiva CLIENTE</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-40 pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-all"
              >
                <item.icon size={20} />
                <span className="text-base">{item.label}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-border mt-4">
              <div className="px-4 py-2">
                <UserButton />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}