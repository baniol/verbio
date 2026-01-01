# Cloudflare Pages Deployment

## Architecture

DNS managed in AWS Route53, hosting on Cloudflare Pages.

```
┌─────────────────┐      ┌─────────────────────────────────────────┐
│   AWS Route53   │      │              CLOUDFLARE                  │
│                 │      │  ┌─────────────┐  ┌───────────────────┐ │
│  CNAME record   │─────▶│  │  Cloudflare │  │  Cloudflare Pages │ │
│  verbio         │      │  │     CDN     │──│  (Static Hosting) │ │
│       ↓         │      │  │   (Cache)   │  │                   │ │
│  *.pages.dev    │      │  └─────────────┘  └───────────────────┘ │
└─────────────────┘      │                            ▲            │
         │               └────────────────────────────┼────────────┘
         │                                            │
         ▼                                            │
    ┌─────────┐                                 ┌─────┴─────┐
    │  User   │                                 │  GitHub   │
    │ Browser │                                 │   Repo    │
    └─────────┘                                 └───────────┘
                                                      │
                                                push to main
                                                      │
                                                      ▼
                                                Auto Deploy
```

## Components

| Component | Role |
|-----------|------|
| **AWS Route53** | DNS - CNAME pointing to `*.pages.dev` |
| **Cloudflare CDN** | Static file caching on edge nodes |
| **Cloudflare Pages** | Static frontend hosting |
| **GitHub Integration** | Auto-deploy on push to `main` |

## Deployment Flow

1. Developer pushes changes to `main` branch
2. Cloudflare Pages detects push (webhook)
3. Runs build command (generates `sets.js`)
4. Deploys `frontend/` to global CDN
5. Automatic cache invalidation

## Project Configuration

### Build settings

| Setting | Value |
|---------|-------|
| **Build command** | `./build.sh` |
| **Build output directory** | `frontend` |
| **Root directory** | `/` |

### Environment variables

None - project doesn't require environment variables.

## File Structure

```
deployment/cloudflare_pages/
├── README.md          # This file
├── build.sh           # Script that builds sets.js
└── deploy.sh          # Manual deploy via Wrangler CLI

frontend/              # <- this is deployed
├── index.html
├── manifest.json
├── sw.js
└── js/
    ├── app.js
    └── sets.js        # Generated during build
```

## Setup (one-time)

### 1. Cloudflare Dashboard

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. **Create application**
3. At the bottom of the page click **"Looking to deploy Pages? Get started"**
4. **Connect to Git** → select your repo
5. Configure:
   - Production branch: `main`
   - Build command: `deployment/cloudflare_pages/build.sh`
   - Build output directory: `frontend`
6. **Save and Deploy**

### 2. AWS Route53

1. Go to Route53 → Hosted zones → your domain
2. Add record:
   - **Name:** subdomain (e.g., `verbio`)
   - **Type:** `CNAME`
   - **Value:** `<your-project>.pages.dev` (from Cloudflare deployments)
   - **TTL:** 300

### 3. Custom domain (Cloudflare)

**IMPORTANT:** This step is required for SSL - without it you'll get `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`.

1. In Cloudflare Dashboard → Your project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter domain (e.g., `app.yourdomain.com`)
4. Cloudflare will show "configure DNS" - **click next** (DNS is already in Route53)
5. CF will verify CNAME and generate SSL certificate (1-2 minutes)

**Note:** With Route53 + Cloudflare Pages you don't have full Cloudflare proxy (no WAF, DDoS protection at CF level). You only get CDN and hosting.

## Deploy

### Option 1: Git push (automatic)

```bash
git push origin main
```

Cloudflare Pages will automatically detect the push and deploy.

### Option 2: Wrangler CLI (manual)

```bash
# One-time setup
npm install -g wrangler
wrangler login

# Deploy
./deployment/cloudflare_pages/deploy.sh
```

The script:
1. Generates `sets.js` from `lang_data/*.json`
2. Deploys `frontend/` to Cloudflare Pages

## Comparison with previous setup (nginx)

| Aspect | Nginx (VPS) | Cloudflare Pages |
|--------|-------------|------------------|
| **Cost** | ~$5/month (Droplet) | $0 |
| **SSL** | Let's Encrypt (manual) | Automatic |
| **CDN** | None | Global edge |
| **Deploy** | rsync + SSH | git push |
| **Maintenance** | OS updates, nginx config | Zero |
| **Scalability** | Manual | Automatic |

## Troubleshooting

### Build failed

Check logs in Cloudflare Dashboard → Deployments → select deploy → View logs

### Old version is displayed

1. Check if deploy completed (Dashboard → Deployments)
2. Hard refresh in browser (Cmd+Shift+R)
3. Check for Service Worker cache (DevTools → Application → Service Workers → Unregister)

### Custom domain doesn't work

1. Check CNAME in Route53 (does it point to correct `*.pages.dev`)
2. Check domain status in Cloudflare Pages → Custom domains
3. Wait up to 5 minutes for DNS propagation
4. Verify with: `dig app.yourdomain.com`
