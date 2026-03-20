# IP Checker Tool & API

## Overview

A simple tool to check your public IP address, served from `/tools/ip` with a backing API at `/api/ip`. The API is protected against cross-site usage by third parties via Origin-based CORS validation.

## API Endpoint

**URL:** `GET /api/ip`

**Response:**
```json
{
  "ip": "203.0.113.42"
}
```

### IP Detection Priority

1. `CF-Connecting-IP` header (Cloudflare)
2. `X-Forwarded-For` header (first IP)
3. `X-Real-IP` header
4. `event.getClientAddress()` (SvelteKit built-in)

## CORS Security

The API checks the `Origin` header on every request:

| Scenario | Result |
|----------|--------|
| Origin present and in allowed list | 200 + CORS headers |
| Origin present and NOT in allowed list | 403 Forbidden |
| No Origin header (curl, server-to-server) | 200, no CORS headers |

### Preflight (OPTIONS)

Returns `204` with CORS headers for allowed origins, `403` for disallowed origins.

## Configuration

### `ALLOWED_ORIGINS`

Comma-separated list of allowed origins. Set in `.env` or environment variables.

```env
ALLOWED_ORIGINS="https://mysite.com,https://other-service.example.com"
```

If not set, falls back to the request's own origin (`event.url.origin`), effectively only allowing same-site requests.

## Usage Examples

### curl
```bash
curl https://yoursite.com/api/ip
# {"ip":"203.0.113.42"}
```

### fetch (browser, same origin)
```js
const res = await fetch('/api/ip');
const { ip } = await res.json();
```

### fetch (cross-origin, allowed)
```js
const res = await fetch('https://yoursite.com/api/ip');
const { ip } = await res.json();
```

## File Structure

```
src/routes/api/ip/+server.ts      # API endpoint
src/routes/tools/ip/+page.svelte  # UI page
```
