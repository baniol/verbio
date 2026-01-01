# Cloudflare Pages Deployment

## Architektura

DNS zarządzany w AWS Route53, hosting na Cloudflare Pages.

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

## Komponenty

| Komponent | Rola |
|-----------|------|
| **AWS Route53** | DNS - CNAME wskazujący na `*.pages.dev` |
| **Cloudflare CDN** | Cache statycznych plików na edge nodes |
| **Cloudflare Pages** | Hosting statycznego frontendu |
| **GitHub Integration** | Auto-deploy przy push do `main` |

## Flow deploymentu

1. Developer pushuje zmiany do `main` branch
2. Cloudflare Pages wykrywa push (webhook)
3. Uruchamia build command (generowanie `sets.js`)
4. Deployuje `frontend/` na globalny CDN
5. Automatyczna invalidacja cache

## Konfiguracja projektu

### Build settings

| Ustawienie | Wartość |
|------------|---------|
| **Build command** | `./build.sh` |
| **Build output directory** | `frontend` |
| **Root directory** | `/` |

### Zmienne środowiskowe

Brak - projekt nie wymaga zmiennych środowiskowych.

## Struktura plików

```
deployment/cloudflare_pages/
├── README.md          # Ten plik
├── build.sh           # Skrypt budujący sets.js
└── deploy.sh          # Ręczny deploy przez Wrangler CLI

frontend/              # <- to jest deployowane
├── index.html
├── manifest.json
├── sw.js
└── js/
    ├── app.js
    └── sets.js        # Generowany podczas buildu
```

## Setup (jednorazowy)

### 1. Cloudflare Dashboard

1. Wejdź na [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. **Create application**
3. Na dole strony kliknij **"Looking to deploy Pages? Get started"**
4. **Connect to Git** → wybierz swoje repo
5. Ustaw:
   - Production branch: `main`
   - Build command: `deployment/cloudflare_pages/build.sh`
   - Build output directory: `frontend`
6. **Save and Deploy**

### 2. AWS Route53

1. Wejdź do Route53 → Hosted zones → twoja domena
2. Dodaj rekord:
   - **Name:** subdomena (np. `verbio`)
   - **Type:** `CNAME`
   - **Value:** `<your-project>.pages.dev` (z Cloudflare deployments)
   - **TTL:** 300

### 3. Custom domain (Cloudflare)

**WAŻNE:** Ten krok jest wymagany dla SSL - bez niego dostaniesz `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`.

1. W Cloudflare Dashboard → Twój projekt → **Custom domains**
2. Kliknij **Set up a custom domain**
3. Wpisz domenę (np. `app.yourdomain.com`)
4. Cloudflare pokaże "configure DNS" - **kliknij dalej** (DNS już masz w Route53)
5. CF zweryfikuje CNAME i wygeneruje certyfikat SSL (1-2 minuty)

**Uwaga:** Przy Route53 + Cloudflare Pages nie masz pełnego Cloudflare proxy (brak WAF, DDoS protection na poziomie CF). Masz tylko CDN i hosting.

## Deploy

### Opcja 1: Git push (automatyczny)

```bash
git push origin main
```

Cloudflare Pages automatycznie wykryje push i zdeployuje.

### Opcja 2: Wrangler CLI (ręczny)

```bash
# Jednorazowy setup
npm install -g wrangler
wrangler login

# Deploy
./deployment/cloudflare_pages/deploy.sh
```

Skrypt:
1. Generuje `sets.js` z `lang_data/*.json`
2. Deployuje `frontend/` na Cloudflare Pages

## Porównanie z poprzednim setupem (nginx)

| Aspekt | Nginx (VPS) | Cloudflare Pages |
|--------|-------------|------------------|
| **Koszt** | ~$5/mies (Droplet) | $0 |
| **SSL** | Let's Encrypt (manual) | Automatyczny |
| **CDN** | Brak | Globalny edge |
| **Deploy** | rsync + SSH | git push |
| **Maintenance** | OS updates, nginx config | Zero |
| **Skalowalność** | Ręczna | Automatyczna |

## Troubleshooting

### Build failed

Sprawdź logi w Cloudflare Dashboard → Deployments → wybierz deploy → View logs

### Stara wersja się wyświetla

1. Sprawdź czy deploy się zakończył (Dashboard → Deployments)
2. Hard refresh w przeglądarce (Cmd+Shift+R)
3. Sprawdź czy nie ma cache w Service Worker (DevTools → Application → Service Workers → Unregister)

### Custom domain nie działa

1. Sprawdź CNAME w Route53 (czy wskazuje na prawidłowy `*.pages.dev`)
2. Sprawdź status domeny w Cloudflare Pages → Custom domains
3. Poczekaj do 5 minut na propagację DNS
4. Sprawdź za pomocą: `dig app.yourdomain.com`
