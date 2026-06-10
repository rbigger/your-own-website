# Deployment Guide: Example Studio

**Project:** example.pages.dev
**Platform:** Cloudflare Pages (Manual Upload)
**Last Updated:** 2026-06-06

---

## Overview

This site uses Cloudflare Pages with manual deployment. Changes are NOT automatically deployed when you push to GitHub. You must manually upload to Cloudflare after each change.

---

## Prerequisites

Before deploying, ensure you have:

1. **Node.js** v22.12.0 or higher installed
2. **Access to Cloudflare Dashboard** (your Cloudflare account email account)
3. **Environment variables configured** in Cloudflare (one-time setup):
   - SANITY_PROJECT_ID = your-project-id
   - SANITY_DATASET = production
   - SANITY_API_TOKEN = (configured in Cloudflare Settings)

---

## Step 1: Build the Project

Open Terminal and run:

```bash
cd /path/to/your-own-website/web
npm install
npm run build
```

This creates the `dist/` folder with the compiled site.

---

## Step 2: Prepare Deployment Package

The deployment package must include:
- All built files from `dist/`
- The `functions/` folder (for Cloudflare Workers)

Run this command to create the package:

```bash
cd /path/to/your-own-website/web
rm -rf deploy_package
mkdir -p deploy_package
cp -r dist/* deploy_package/
cp -r functions deploy_package/
```

This creates: `/path/to/your-own-website/web/deploy_package`

---

## Step 3: Upload to Cloudflare

1. Open browser: https://dash.cloudflare.com
2. Log in with your Cloudflare account email
3. Click **Workers & Pages** in left sidebar
4. Click **your-project**
5. Click **Deployments** tab
6. Click **Create deployment** button
7. Select **Production** environment
8. Click the word **folder** in the upload area
9. A Finder window opens:
   - Press `Cmd + Shift + G` (Go to folder dialog)
   - Paste: `/path/to/your-own-website/web/deploy_package`
   - Press **Enter**
10. You are now inside the deploy_package folder
11. Press `Cmd + A` to select all contents
12. Click **Upload** (or **Open**)
13. Wait for upload to complete (progress bar shows)
14. Click **Save and deploy** button (bottom right)
15. Wait for deployment to finish

---

## Step 4: Verify Deployment

After deployment completes, verify it worked:

### Test 1: Site loads
- Open: https://example.pages.dev
- Confirm homepage displays correctly

### Test 2: Worker endpoint responds
- Open Terminal and run:
```bash
curl -X GET https://example.pages.dev/api/comment
```
- Expected response: `{"error":"Method not allowed"}` with HTTP 405
- If you see HTML instead, the Worker is not deployed correctly

### Test 3: POST endpoint works
```bash
curl -X POST https://example.pages.dev/api/comment \
  -d "name=Test&comment=Test"
```
- Expected: HTTP 303 redirect (or 200 with success message)

---

## Troubleshooting

### Problem: Worker returns HTML instead of JSON

**Cause:** Functions folder not included in deployment.

**Fix:** Ensure `functions/` folder is in `deploy_package/` before uploading:
```bash
ls deploy_package/functions/api/
# Should show: comment.ts
```

### Problem: 500 error when submitting comment

**Cause:** Environment variables not configured.

**Fix:**
1. Go to Cloudflare > Workers & Pages > your-project > Settings
2. Click Environment Variables
3. Verify these exist:
   - SANITY_PROJECT_ID
   - SANITY_DATASET
   - SANITY_API_TOKEN
4. Redeploy after adding variables

### Problem: Build fails

**Fix:**
```bash
cd /path/to/your-own-website/web
rm -rf node_modules
npm install
npm run build
```

---

## Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| PUBLIC_SANITY_PROJECT_ID | your-project-id | Sanity project identifier |
| PUBLIC_SANITY_DATASET | production | Sanity dataset name |
| PUBLIC_SANITY_API_VERSION | 2024-01-01 | Sanity API version (optional) |
| SANITY_API_TOKEN | (secret) | API token for creating comments |
| PUBLIC_ENABLE_COMMENTS | true | Enable/disable comment system |
| CONTENT_PROVIDER | sanity | Content provider selection (optional) |

**Note:** Environment variables are configured in Cloudflare Dashboard, NOT in local files. They are encrypted and secure.

---

## Comments: Portability Considerations

The comment system is the **only non-portable feature** of this site. It requires Cloudflare Pages Functions to process form submissions.

### For Cloudflare Pages Deployment (Default)

Comments work automatically. The `functions/api/comment.ts` endpoint handles submissions.

### For Static-Only Hosting (Netlify, Vercel Static, S3, etc.)

If deploying to a host without serverless function support:

1. **Set the environment variable:**
   ```
   PUBLIC_ENABLE_COMMENTS=false
   ```

2. **Rebuild the site:**
   ```bash
   PUBLIC_ENABLE_COMMENTS=false npm run build
   ```

3. **Deploy only the `dist/` folder** (no functions folder needed)

When `PUBLIC_ENABLE_COMMENTS=false`:
- Comment form does not render
- Comment list does not render
- No `/api/comment` reference in output
- Site is fully static and portable

### Warning

**Do NOT leave comments enabled on a static-only host.** The comment form will appear but submissions will fail with a 404 error.

See: `docs/ADR-YOW-003-comment-isolation.md` for architecture details.

---

## Quick Deploy Script

For convenience, you can run this single command to build and prepare:

```bash
cd /path/to/your-own-website/web && \
npm run build && \
rm -rf deploy_package && \
mkdir -p deploy_package && \
cp -r dist/* deploy_package/ && \
cp -r functions deploy_package/ && \
echo "Ready to deploy: /path/to/your-own-website/web/deploy_package"
```

Then follow Step 3 to upload to Cloudflare.

---

## File Structure

```
pilot_site/
├── docs/
│   ├── DEPLOYMENT-GUIDE.md      (this file)
│   └── plans/
│       ├── PLAN-COMMENT-SYSTEM.md
│       └── ...
├── studio/                       (Sanity Studio)
│   └── schemaTypes/
│       └── comment.ts
└── web/                          (Astro site)
    ├── dist/                     (build output)
    ├── functions/                (Cloudflare Workers)
    │   └── api/
    │       └── comment.ts
    ├── deploy_package/           (created for upload)
    ├── src/
    └── package.json
```

---

## Contact

- **Sanity Studio:** https://example.sanity.studio
- **Live Site:** https://example.pages.dev
- **Cloudflare Dashboard:** https://dash.cloudflare.com

---

*Document created: 2026-06-06*
*Author: ARCHITECT_20260526_121237_065479*

