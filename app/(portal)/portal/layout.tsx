import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { PortalHeader } from "./PortalHeader";

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
      <PortalHeader userName={user?.name ?? null} />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
