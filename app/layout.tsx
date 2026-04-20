import { AuthProvider } from "@/lib/auth";
import type { Metadata } from "next";
import { Fraunces, Syne } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: "Édouard",
  description: "Jouez au jeu d'Édouard !",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-[family-name:var(--font-syne)]">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
