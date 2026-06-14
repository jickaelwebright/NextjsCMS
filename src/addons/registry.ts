export interface AddonMeta {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  version: string;
  navItems?: Array<{ href: string; label: string; icon: string }>;
}

export const ADDONS: AddonMeta[] = [
  {
    name: "shop",
    displayName: "Shop",
    description: "Full eCommerce: products, cart, Stripe checkout, orders, and secure digital downloads.",
    icon: "ShoppingBag",
    version: "1.0.0",
    navItems: [
      { href: "/admin/products", label: "Products", icon: "Package" },
      { href: "/admin/orders",   label: "Orders",   icon: "ShoppingCart" },
    ],
  },
];

export function getAddon(name: string): AddonMeta | undefined {
  return ADDONS.find((a) => a.name === name);
}
