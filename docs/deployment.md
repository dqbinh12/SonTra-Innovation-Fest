# Deployment runbook

Target: the client's own server, three containers behind a reverse proxy.

> **Unverified.** Decision Log #6 (server specs, OS, existing setup) is still
> open. This runbook assumes a Linux host with Docker Engine and the Compose
> plugin. Confirm that before promising a go-live date.

## Suggested domains

| Host | Serves |
| ---- | ------ |
| `www.innovationfest.vn` | Next.js frontend (port 3000) |
| `cms.innovationfest.vn` | Strapi admin + API (port 1337) |

Both containers bind to `127.0.0.1`, so only the reverse proxy can reach them.

## First deploy

```bash
git clone <repo-url> sif && cd sif
```

```bash
cp infra/.env.example infra/.env
```

Fill in `infra/.env`. Every secret should be freshly generated:

```bash
openssl rand -base64 32
```

`APP_KEYS` takes a comma-separated list — generate four and join them.

```bash
docker compose -f infra/docker-compose.yml --env-file infra/.env up -d --build
```

The first build takes several minutes (Strapi compiles its admin panel).

## After the first deploy

1. Open `https://cms.<domain>/admin` and create the first admin account.
   Do this immediately — the registration page is open until someone claims it.
2. Create the **Editor** role for the client team: content create/edit/publish
   only, no schema access (Scope tab, CMS section).
3. **Settings → API Tokens** → create a read-only token. Put it in `infra/.env`
   as `STRAPI_API_TOKEN` and restart the `web` service.
4. The revalidation webhook registers itself on boot from `SITE_URL` and
   `REVALIDATE_SECRET` in `infra/.env` — check the startup log for
   `[bootstrap] registered revalidation webhook`. If it warns instead, those
   two variables are missing and published content will take up to an hour to
   appear. Rotating the secret is safe: the next boot repairs the stored
   webhook to match.

## Redeploying

```bash
git pull && docker compose -f infra/docker-compose.yml --env-file infra/.env up -d --build
```

Uploaded media lives in the `cms-uploads` volume and the database in `db-data`,
so neither survives a `docker compose down -v`. Don't use `-v`.

## Backups

Nothing is automated yet. At minimum, before go-live set up a nightly:

```bash
docker compose -f infra/docker-compose.yml exec -T db pg_dump -U sif sif | gzip > sif-$(date +%F).sql.gz
```

Media needs a separate copy of the `cms-uploads` volume.

## Reverse proxy notes

- Strapi's admin uploads need a body-size limit above the default 1 MB.
  For nginx: `client_max_body_size 50M;` on the CMS host.
- Forward `X-Forwarded-Proto` so Strapi generates `https://` media URLs.
- The `NEXT_PUBLIC_*` variables are baked in at image build time, so changing
  the domain means rebuilding the `web` image, not just restarting it.
- `NEXT_PUBLIC_STRAPI_URL` must be a URL a **browser** can reach, on a public
  address. Next 16 refuses to optimize images from hosts that resolve to a
  private IP, so pointing it at an internal hostname or LAN address makes every
  CMS image 400. The internal address belongs in `STRAPI_URL`, which is
  server-side only and already set to `http://cms:1337` by compose.
