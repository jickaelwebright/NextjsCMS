import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "superadmin") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-sm">NextjsCMS — Super Admin</span>
        <span className="text-xs text-gray-400">{(session.user as any).email}</span>
      </header>
      {children}
    </div>
  );
}
