import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getSuperadminDb } from "@/db/superadmin";
import { tenants } from "@/db/schema/superadmin";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? "admin@cms.local";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD ?? "changeme";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantSlug: { label: "Tenant", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, tenantSlug } = credentials as {
          email: string;
          password: string;
          tenantSlug?: string;
        };

        // Superadmin login
        if (!tenantSlug || tenantSlug === "__superadmin__") {
          if (
            email === SUPERADMIN_EMAIL &&
            password === SUPERADMIN_PASSWORD
          ) {
            return { id: "superadmin", email, role: "superadmin", tenantSlug: "__superadmin__" };
          }
          return null;
        }

        // Per-tenant admin login
        const db = await getSuperadminDb();
        const tenant = await db
          .select()
          .from(tenants)
          .where(eq(tenants.slug, tenantSlug))
          .get();

        if (!tenant || tenant.plan === "suspended") return null;
        if (tenant.adminEmail !== email) return null;

        const valid = await bcrypt.compare(password, tenant.adminPasswordHash);
        if (!valid) return null;

        return {
          id: tenant.id,
          email: tenant.adminEmail,
          role: "tenant-admin",
          tenantSlug: tenant.slug,
          tenantName: tenant.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantSlug = (user as any).tenantSlug;
        token.tenantName = (user as any).tenantName;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role;
      (session.user as any).tenantSlug = token.tenantSlug;
      (session.user as any).tenantName = token.tenantName;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
