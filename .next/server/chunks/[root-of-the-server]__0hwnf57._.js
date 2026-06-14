module.exports=[24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},77630,e=>{"use strict";var t=e.i(75799),r=e.i(80568),a=e.i(37540);let s=(0,t.sqliteTable)("tenants",{id:(0,r.text)("id").primaryKey(),slug:(0,r.text)("slug").notNull().unique(),name:(0,r.text)("name").notNull(),customDomain:(0,r.text)("custom_domain"),adminEmail:(0,r.text)("admin_email").notNull(),adminPasswordHash:(0,r.text)("admin_password_hash").notNull(),dbPath:(0,r.text)("db_path").notNull(),plan:(0,r.text)("plan",{enum:["active","suspended"]}).notNull().default("active"),createdAt:(0,a.integer)("created_at",{mode:"timestamp"}).notNull()}),n=(0,t.sqliteTable)("cms_settings",{key:(0,r.text)("key").primaryKey(),value:(0,r.text)("value").notNull()});e.s(["cmsSettings",0,n,"tenants",0,s])},10925,e=>e.a(async(t,r)=>{try{var a=e.i(18520),s=e.i(19756),n=e.i(14747),i=e.i(22734),l=e.i(77630),o=t([a,s]);[a,s]=o.then?(await o)():o;let u=null;async function d(){let e,t=(e=process.env.DATA_DIR?n.default.resolve(process.env.DATA_DIR):n.default.join(process.cwd(),"data"),i.default.mkdirSync(e,{recursive:!0}),n.default.join(e,"superadmin.db")),r=(0,a.createClient)({url:`file:${t}`});return await r.execute(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      custom_domain TEXT,
      admin_email TEXT NOT NULL,
      admin_password_hash TEXT NOT NULL,
      db_path TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    )
  `),await r.execute(`
    CREATE TABLE IF NOT EXISTS cms_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `),(0,s.drizzle)(r,{schema:l})}let x=null;async function p(){return u||(x||(x=d().then(e=>(u=e,e))),x)}e.s(["getSuperadminDb",0,p]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0hwnf57._.js.map