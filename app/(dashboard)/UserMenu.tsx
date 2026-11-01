"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative flex items-center" ref={menuRef}>
      {/* Botón que abre el menú */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 w-full rounded-xl hover:bg-muted/50 transition-colors group"
      >
        {/* Avatar del usuario */}
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName || "Usuario"}
            className="w-8 h-8 rounded-full border border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <UserIcon size={16} />
          </div>
        )}
        
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground truncate w-full text-left">
            {user.firstName || "Mi Cuenta"}
          </span>
          <span className="text-[10px] text-muted-foreground truncate w-full text-left">
            {user.primaryEmailAddress?.emailAddress}
          </span>
        </div>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 border-b border-border/50">
            <Link
              href="/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Settings size={16} className="text-muted-foreground" />
              Mi Perfil
            </Link>
          </div>
          
          <div className="p-2">
            <button
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}