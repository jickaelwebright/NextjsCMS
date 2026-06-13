import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;
  const tenantName = user.tenantName ?? user.tenantSlug ?? "Admin";
  const userEmail = user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar tenantName={tenantName} userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
