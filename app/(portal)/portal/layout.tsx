import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <nav className="flex items-center gap-1">
            <Link
              href="/portal"
              className="text-xl font-semibold text-slate-900 tracking-tight"
            >
              MediTrack <span className="text-primary-600">Portal</span>
            </Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link
              href="/portal"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              Dashboard
            </Link>
            <Link
              href="/portal/appointments"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              Appointments
            </Link>
            <Link
              href="/portal/medications"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              Medications
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <img src="https://cdn-icons-png.flaticon.com/128/16424/16424883.png" alt="User" width={24} height={24} className="h-6 w-6" />
            <span className="text-sm font-medium text-slate-700">{user?.name ?? "Patient"}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
