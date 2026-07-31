"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, UserButton } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export default function MobileMenu({ navItems }: { navItems: NavItem[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
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
    </>
  );
}