# RentHQ Frontend Deployment to Netlify

This guide deploys `vue-frontend-biller` to Netlify and uses an environment variable for your backend API URL.

## 1) Prerequisites

- Frontend repo pushed to GitHub/GitLab/Bitbucket
- Backend API already deployed publicly (example: `https://api.yourdomain.com`)
- Backend serves your endpoints under `/api` (example: `https://api.yourdomain.com/api`)

## 2) Netlify Site Setup

1. Go to Netlify → **Add new site** → **Import an existing project**
2. Select your frontend repository
3. Use these build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

This is also committed in `netlify.toml`.

## 3) Set Backend API URL in Netlify Environment Variables

In Netlify site settings:

- **Site configuration** → **Environment variables** → **Add variable**
- Add:
  - Key: `VITE_API_BASE_URL`
  - Value: `https://api.yourdomain.com/api`

> Important: include `/api` at the end if your Flask routes are under `/api`.

Then trigger a new deploy.

## 4) SPA Routing Support

`netlify.toml` includes a redirect so Vue routes work on refresh:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 5) Local Development Env (optional)

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Example values:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
```

## 6) Backend CORS Requirement

Your backend must allow requests from your Netlify domain, e.g.:

- `https://your-site.netlify.app`
- or your custom frontend domain

If CORS is not configured on backend, browser requests will fail even if the URL is correct.

## 7) Verify After Deploy

- Open browser DevTools → Network
- Confirm API requests go to `VITE_API_BASE_URL`
- Confirm endpoints return 2xx/4xx normally (not CORS/network errors)

---

## Quick Summary

- Frontend reads backend URL from `VITE_API_BASE_URL`
- Set that variable in Netlify
- Redeploy
- Ensure backend CORS allows your Netlify domain
