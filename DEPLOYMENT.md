# Deployment Guide

## Prerequisites

All deployment methods require:

- **Node.js 20 LTS** or later (check: `node -v`)
- **npm 9+** (check: `npm -v`)
- **Git**
- A **writable directory outside `public_html`** for SQLite database files
- A **domain or subdomain** pointing to your server

### Generate required secrets

```bash
# NEXTAUTH_SECRET — run once, copy the output
openssl rand -base64 32
```

### Environment variables reference

| Variable | Description | Example |
|---|---|---|
| `NEXTAUTH_SECRET` | Random 32+ char secret for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your exact production URL (with https://) | `https://cms.youragency.com` |
| `SUPERADMIN_EMAIL` | Super-admin login email | `admin@youragency.com` |
| `SUPERADMIN_PASSWORD` | Super-admin login password (use something strong) | — |
| `DATA_DIR` | Absolute path to SQLite storage directory | `/home/username/cms-data` |

### Optional AI integration keys (set in Settings → AI Integration after deploy)

| Variable | Provider |
|---|---|
| `OPENAI_API_KEY` | OpenAI (GPT-4o etc.) |
| `OPENROUTER_API_KEY` | OpenRouter (access 100+ models) |
| `NVIDIA_NIM_API_KEY` | NVIDIA NIM (Llama, Nemotron) |
| `GEMINI_API_KEY` | Google Gemini |

AI keys can also be set per-tenant in **Settings → AI Integration** after the app is running (stored in each tenant's SQLite database).

---

## Option 1: cPanel Node.js Selector (Shared Hosting)

**Best for:** InMotion Hosting, A2 Hosting, Namecheap, SiteGround, HostGator, and other managed cPanel hosts that include a Node.js Selector.

### Step 1 — SSH into your server and clone the repo

```bash
ssh username@yourdomain.com
cd /home/username
git clone https://github.com/your-org/nextjscms.git
cd nextjscms
```

### Step 2 — Create a data directory outside public_html

```bash
mkdir -p /home/username/cms-data
chmod 755 /home/username/cms-data
```

> SQLite files must live outside `public_html` to prevent direct web access.

### Step 3 — Create `.env.local`

```bash
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=REPLACE_WITH_OUTPUT_OF_OPENSSL_RAND
NEXTAUTH_URL=https://yourdomain.com
SUPERADMIN_EMAIL=admin@youragency.com
SUPERADMIN_PASSWORD=your-strong-password-here
DATA_DIR=/home/username/cms-data
EOF
```

### Step 4 — Install dependencies and build

```bash
npm install
npm run build
```

### Step 5 — Create a startup file

Create `server.js` in the project root:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`> Ready on port ${PORT}`);
  });
});
```

### Step 6 — Configure the Node.js App in cPanel

1. Log in to **cPanel** → scroll to find **"Setup Node.js App"** or **"Node.js Selector"**
2. Click **"Create Application"**
3. Fill in the fields:

| Field | Value |
|---|---|
| Node.js version | **20.x** (or latest available LTS) |
| Application mode | **Production** |
| Application root | `/home/username/nextjscms` (full path to the cloned repo) |
| Application URL | `yourdomain.com` or `cms.yourdomain.com` |
| Application startup file | `server.js` |

4. In the **Environment Variables** section, add each variable from your `.env.local`:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `SUPERADMIN_EMAIL`
   - `SUPERADMIN_PASSWORD`
   - `DATA_DIR`

5. Click **"Create"**
6. Click **"Run NPM Install"** (cPanel installs production dependencies)
7. Click **"Start App"**

### Deploying updates

```bash
cd /home/username/nextjscms
git pull origin main
npm install
npm run build
# Then click "Restart App" in cPanel Node.js Selector
```

### Common cPanel issues

| Problem | Fix |
|---|---|
| "Cannot find module 'next'" | Click "Run NPM Install" in Node.js Selector panel |
| Blank page / NEXTAUTH error | Ensure `NEXTAUTH_URL` exactly matches your live URL (with `https://`) |
| SQLite "SQLITE_READONLY" error | Move `DATA_DIR` to `/home/username/cms-data` (outside `public_html`) |
| App won't start, shows Node.js crash | Check cPanel error log; likely missing env var or wrong startup file path |
| Port conflict | Ask host for an available port; set `PORT=XXXX` in env vars |

---

## Option 2: VPS with PM2 + Nginx

**Best for:** cPanel VPS, DigitalOcean Droplets, Linode, Hetzner, AWS EC2, or any Linux VPS where you have root SSH access.

### Step 1 — Install Node.js via NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v   # should print v20.x.x
```

### Step 2 — Clone, configure, build

```bash
cd /var/www
git clone https://github.com/your-org/nextjscms.git
cd nextjscms

mkdir -p /var/www/cms-data

cp .env.example .env.local
nano .env.local   # fill in all values
```

```bash
npm install
npm run build
```

### Step 3 — Run with PM2

```bash
npm install -g pm2

pm2 start "npm start" --name nextjscms
pm2 save
pm2 startup   # copy and run the command it outputs to enable auto-start on reboot
```

Useful PM2 commands:

```bash
pm2 status           # check if running
pm2 logs nextjscms   # tail logs
pm2 restart nextjscms
pm2 stop nextjscms
```

### Step 4 — Nginx reverse proxy

```bash
apt install nginx -y
```

Create `/etc/nginx/sites-available/nextjscms`:

```nginx
server {
    listen 80;
    server_name cms.youragency.com;

    # Increase body size for media uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/nextjscms /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 5 — SSL with Let's Encrypt

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d cms.youragency.com
# Certbot auto-configures HTTPS and redirects; also sets up auto-renewal
```

### Deploying updates

```bash
cd /var/www/nextjscms
git pull origin main
npm install
npm run build
pm2 restart nextjscms
```

---

## Option 3: Coolify (Docker-based PaaS on your VPS)

**Best for:** Teams who want Heroku-like one-click Git deploys and a web dashboard, running on their own server.

### Step 1 — Install Coolify on a fresh VPS

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Open `http://your-server-ip:8000` and complete the Coolify setup wizard.

### Step 2 — Add the repository

1. Coolify dashboard → **+ New Resource** → **Application**
2. Connect your Git provider (GitHub, GitLab, Bitbucket, or Gitea)
3. Select the NextjsCMS repository

### Step 3 — Configure build settings

| Setting | Value |
|---|---|
| Build pack | **Nixpacks** (auto-detects Next.js) |
| Build command | `npm run build` |
| Start command | `npm start` |
| Port | `3000` |

### Step 4 — Add a persistent volume (required for SQLite)

1. Go to the **Storage** tab
2. Click **"Add Volume"**
3. Set mount path to `/app/data`
4. Set `DATA_DIR=/app/data` in environment variables

> Without a persistent volume, SQLite data is lost on every redeploy.

### Step 5 — Environment variables

In the **Environment Variables** tab, add all variables from the Prerequisites section.

### Step 6 — Deploy

Click **Deploy**. Coolify builds the Docker image and starts the container. Future pushes to your configured branch trigger automatic redeploys.

---

## Option 4: CapRover (Alternative Docker PaaS)

Similar to Coolify. After installing CapRover on a VPS:

1. Create a new app in the CapRover dashboard
2. In the **App Configs** tab, add environment variables
3. In the **Persistent Data** tab, add a volume: `/captain/data` → `/app/data`
4. In the **Deployment** tab, connect your Git repo and deploy

---

## Option 5: Railway (Cloud with Persistent Disks)

Railway supports persistent disks, so SQLite works without modifications.

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

1. In the Railway dashboard, add a **Volume** mounted at `/app/data`
2. Set `DATA_DIR=/app/data` in the environment variables panel
3. Set all other required env vars
4. Redeploy

---

## Option 6: Render (Cloud with Persistent Disks)

1. Create a new **Web Service** on render.com, connect your GitHub repo
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add a **Persistent Disk**: mount path `/app/data`, set `DATA_DIR=/app/data`
5. Add all env vars in the **Environment** tab

> Vercel is not recommended for this project because it uses a read-only filesystem. SQLite writes require a persistent disk.

---

## Multi-Tenant Domain Configuration

### Path-prefix routing (default — no DNS setup needed)

Works out of the box. Each tenant accesses their site at:

```
https://cms.youragency.com/sites/acme/       ← tenant "acme"
https://cms.youragency.com/sites/globex/     ← tenant "globex"
```

### Subdomain routing

Requires a wildcard DNS record.

1. In your DNS provider, add: `*.cms.youragency.com → your-server-IP` (A record)
2. In Nginx, add `server_name *.cms.youragency.com;` to your server block
3. For SSL: `certbot --nginx -d cms.youragency.com -d *.cms.youragency.com`
   (requires DNS challenge for wildcard: `certbot --manual --preferred-challenges dns ...`)

The proxy middleware automatically extracts the first subdomain segment as the tenant slug.

### Custom domain per tenant (e.g., `acme.com` → tenant "acme")

1. The client sets their domain's A record to point to your server IP
2. Add the domain to Nginx `server_name`:
   ```nginx
   server_name cms.youragency.com *.cms.youragency.com acme.com;
   ```
3. Get an SSL certificate for the custom domain:
   ```bash
   certbot --nginx -d acme.com
   ```
4. In the super-admin panel (`/superadmin`), edit the tenant and set `customDomain = acme.com`

---

## Database Backup

Each tenant's data is a single SQLite file. Backup is simple:

```bash
# Backup all tenant databases
cp -r /home/username/cms-data /home/username/cms-data-backup-$(date +%Y%m%d)

# Or tar and compress
tar -czf cms-backup-$(date +%Y%m%d).tar.gz /home/username/cms-data
```

Set up a cron job for automated nightly backups:

```bash
crontab -e
# Add:
0 2 * * * tar -czf /home/username/backups/cms-$(date +\%Y\%m\%d).tar.gz /home/username/cms-data
```

---

## Security Checklist

Before going live:

- [ ] `NEXTAUTH_SECRET` is a unique random string (run `openssl rand -base64 32`)
- [ ] `SUPERADMIN_PASSWORD` is strong (12+ chars, mixed case, symbols)
- [ ] `NEXTAUTH_URL` is set to your exact production URL with `https://`
- [ ] `DATA_DIR` is outside `public_html` / not web-accessible
- [ ] HTTPS is enabled (SSL certificate installed)
- [ ] SQLite backup cron job is configured
- [ ] (VPS) Firewall configured: `ufw allow 22,80,443/tcp && ufw enable`
- [ ] (VPS) SSH key authentication enabled, password auth disabled
