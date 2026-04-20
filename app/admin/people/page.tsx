"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/ui/Header";
import PeopleTable from "@/components/admin/PeopleTable";
import { NavLink } from "@/components/ui/NavLink";

export default function AdminPeoplePage() {
  const { token, role, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (!token) { router.replace("/login"); return; }
    if (role && role !== "ADMIN" && role !== "SUPERADMIN") {
      router.replace("/game");
    }
  }, [initialized, token, role, router]);

  const authorized =
    initialized && !!token && (role === "ADMIN" || role === "SUPERADMIN");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-4">
        <nav className="flex gap-4 text-sm border-b border-gray-200 dark:border-gray-800 pb-3">
          <span className="font-semibold text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white pb-3 -mb-3">Personnes</span>
          {role === "SUPERADMIN" && (
            <NavLink href="/admin/users" variant="muted">Utilisateurs</NavLink>
          )}
        </nav>
        {authorized && <PeopleTable />}
      </main>
    </div>
  );
}
