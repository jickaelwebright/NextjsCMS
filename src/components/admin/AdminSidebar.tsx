"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, BookOpen, Image,
  Layout, Settings, LogOut, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/pages",     label: "Pages",      icon: FileText },
  { href: "/admin/posts",     label: "Blog Posts", icon: BookOpen },
  { href: "/admin/media",     label: "Media",      icon: Image },
  { href: "/admin/templates", label: "Templates",  icon: Layout },
  { href: "/admin/settings",  label: "Settings",   icon: Settings },
] as const;

interface AdminSidebarProps {
  tenantName: string;
  userEmail: string;
}

export function AdminSidebar({ tenantName, userEmail }: AdminSidebarProps) {
  const path = usePathname();

  return (
    <aside className="w-56 flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-blue-400" />
          <div>
            <p className="text-sm font-bold">NextjsCMS</p>
            <p className="text-xs text-gray-400 truncate max-w-[140px]">{tenantName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/admin" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate mb-2">{userEmail}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
