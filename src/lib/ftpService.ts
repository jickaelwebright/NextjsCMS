import * as ftp from "basic-ftp";
import { Readable } from "stream";

export interface FTPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  remotePath: string;
  secure: boolean;
}

export interface DeployFile {
  remotePath: string;
  content: string;
}

export async function testFTPConnection(
  config: FTPConfig
): Promise<{ ok: boolean; error?: string }> {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      secure: config.secure,
    });
    await client.list(config.remotePath);
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Connection failed" };
  } finally {
    client.close();
  }
}

export async function uploadToFTP(
  config: FTPConfig,
  files: DeployFile[]
): Promise<{ uploaded: string[]; errors: Array<{ path: string; error: string }> }> {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  const uploaded: string[] = [];
  const errors: Array<{ path: string; error: string }> = [];

  try {
    await client.access({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      secure: config.secure,
    });

    for (const file of files) {
      try {
        const remoteDir = file.remotePath.split("/").slice(0, -1).join("/");
        if (remoteDir) await client.ensureDir(remoteDir);

        const stream = Readable.from(Buffer.from(file.content, "utf8"));
        await client.uploadFrom(stream, file.remotePath);
        uploaded.push(file.remotePath);
      } catch (err: unknown) {
        errors.push({
          path: file.remotePath,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }
  } finally {
    client.close();
  }

  return { uploaded, errors };
}

// Rewrite /_next/ and /uploads/ URLs to absolute so FTP site loads CSS/JS from CMS server
export function absolutifyHtml(html: string, cmsBaseUrl: string): string {
  const cms = cmsBaseUrl.replace(/\/$/, "");
  const assetPrefixes = ["/_next/", "/uploads/", "/favicon", "/_vercel/"];
  return html.replace(/(href|src|action)="(\/[^"]*)/g, (match, attr, path) => {
    if (assetPrefixes.some((p) => path.startsWith(p))) {
      return `${attr}="${cms}${path}`;
    }
    return match;
  });
}
