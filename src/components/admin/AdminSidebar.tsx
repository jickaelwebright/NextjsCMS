"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, BookOpen, Image,
  Layout, Settings, LogOut, Layers, Inbox, Puzzle,
  Package, ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CORE_NAV = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/pages",     label: "Pages",      icon: FileText },
  { href: "/admin/posts",     label: "Blog Posts", icon: BookOpen },
  { href: "/admin/media",     label: "Media",      icon: Image },
  { href: "/admin/templates", label: "Templates",  icon: Layout },
  { href: "/admin/forms",     label: "Forms",      icon: Inbox },
] as const;

const SHOP_NAV = [
  { href: "/admin/products", label: "Products",  icon: Package },
  { href: "/admin/orders",   label: "Orders",    icon: ShoppingCart },
] as const;

const BOTTOM_NAV = [
  { href: "/admin/addons",   label: "Addons",    icon: Puzzle },
  { href: "/admin/settings", label: "Settings",  icon: Settings },
] as const;

interface AdminSidebarProps {
  tenantName: string;
  userEmail: string;
  enabledAddons?: string[];
}

export function AdminSidebar({ tenantName, userEmail, enabledAddons = [] }: AdminSidebarProps) {
  const path = usePathname();
  const shopEnabled = enabledAddons.includes("shop");

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{size?: number}> }) {
    const active = path === href || (href !== "/admin" && path.startsWith(href));
    return (
      <Link
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
  }

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
        {CORE_NAV.map((item) => <NavLink key={item.href} {...item} />)}

        {/* Shop addon nav (only when enabled) */}
        {shopEnabled && (
          <>
            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shop</p>
            {SHOP_NAV.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}

        <div className="border-t border-gray-700 mt-3 pt-3">
          {BOTTOM_NAV.map((item) => <NavLink key={item.href} {...item} />)}
        </div>
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
