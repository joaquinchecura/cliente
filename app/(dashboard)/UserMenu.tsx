"use client";

import { UserButton } from "@clerk/nextjs";

export default function UserMenu() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <UserButton afterSignOutUrl="/sign-in" />
      <span className="text-sm text-zinc-400">Mi Cuenta</span>
    </div>
  );
}