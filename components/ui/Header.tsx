"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { NavLink } from "@/components/ui/NavLink";

export default function Header() {
  const { role, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <Link href="/game" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-[family-name:var(--font-fraunces)]">
        Édouard
      </Link>
      <nav className="flex items-center gap-6 text-base">
        <NavLink href="/game">Jouer</NavLink>
        {isAdmin && <NavLink href="/admin/people">Admin</NavLink>}
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          Déconnexion
        </button>
      </nav>
    </header>
  );
}
