export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

function checkWritable(dir: string): boolean {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const test = path.join(dir, ".write-test");
    fs.writeFileSync(test, "ok");
    fs.unlinkSync(test);
    return true;
  } catch { return false; }
}

function checkSQLite(): boolean {
  try {
    const Database = require("better-sqlite3");
    const db = new Database(":memory:");
    db.exec("CREATE TABLE t (id INTEGER PRIMARY KEY); INSERT INTO t VALUES (1);");
    const row = db.prepare("SELECT id FROM t").get();
    db.close();
    return row?.id === 1;
  } catch { return false; }
}

function nodeVersionOk(): boolean {
  const [major] = process.version.replace("v", "").split(".").map(Number);
  return major >= 18;
}

export async function GET() {
  const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  const authSecret = process.env.NEXTAUTH_SECRET ?? "";
  const authUrl = process.env.NEXTAUTH_URL ?? "";
  const superAdminEmail = process.env.SUPERADMIN_EMAIL ?? "";

  const checks = {
    nodeVersion: process.version,
    nodeVersionOk: nodeVersionOk(),
    sqliteOk: checkSQLite(),
    dataDirPath: dataDir,
    dataDirWritable: checkWritable(dataDir),
    uploadsDirWritable: checkWritable(uploadsDir),
    authSecretSet: authSecret.length > 0 && authSecret !== "please-change-this-to-a-random-32-char-string",
    authUrlSet: authUrl.length > 0,
    superadminEmailSet: superAdminEmail.length > 0,
    platform: os.platform(),
    hostname: os.hostname(),
  };

  const allOk = checks.nodeVersionOk && checks.sqliteOk && checks.dataDirWritable
    && checks.authSecretSet && checks.superadminEmailSet;

  return NextResponse.json({ ...checks, allOk });
}
