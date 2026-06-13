export interface Tenant {
  id: string;
  slug: string;
  name: string;
  customDomain: string | null;
  adminEmail: string;
  adminPasswordHash: string;
  dbPath: string;
  plan: "active" | "suspended";
  createdAt: Date;
}

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
}
