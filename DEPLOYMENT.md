# Deployment Guide

This guide covers deploying the app with ICP extraction working on GitHub Pages.

## Architecture

- **Next.js app** → Deployed to GitHub Pages (static)
- **Python ICP Extractor** → Deployed to Railway (free tier)
- **Flow**: User enters website URL → Client fetches Railway API directly → ICP extracted

## Step 1: Deploy ICP Extractor to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub.

2. **Create an empty project first** (avoids "workspaceId" error): Go to [railway.app/new](https://railway.app/new) → **Empty Project** → Create.

3. Inside the project, click **Add Service** → **GitHub Repo** → Select this repository.

4. In the new service settings:
   - Set **Root Directory** to `icp-extractor`
   - Go to **Variables** and add `OPENAI_API_KEY` = your OpenAI API key ([platform.openai.com](https://platform.openai.com/api-keys))

5. Go to **Settings** → **Networking** → **Generate Domain** to get a public URL (e.g. `https://icp-extractor-production-xxxx.up.railway.app`).

6. Copy the generated URL for Step 2.

## Step 2: Configure GitHub Repository

1. In your repo: **Settings** → **Secrets and variables** → **Actions**.

2. Go to the **Variables** tab (not Secrets) and click **New repository variable**:
   - **Name**: `NEXT_PUBLIC_ICP_EXTRACTOR_URL`
   - **Value**: Your Railway URL (e.g. `https://icp-extractor-production-xxxx.up.railway.app`) — no trailing slash, no port.

3. Save. **Re-run the deploy workflow** (Actions → Deploy to GitHub Pages → Re-run) so the new variable is baked into the build.

4. **Verify**: Check the workflow logs for "NEXT_PUBLIC_ICP_EXTRACTOR_URL is configured." If you see a warning instead, the variable is not set correctly.

## Step 3: Deploy

Push to `main` or run the workflow manually. The build will:
- Use `NEXT_PUBLIC_ICP_EXTRACTOR_URL` at build time
- Deploy the static site to GitHub Pages

When users enter a website URL, the app will call your Railway ICP extractor.

## Local Development

- **Without Railway**: Run `npm run icp-extractor` in one terminal and `npm run dev` in another. The app uses `/api/extract-icp` which proxies to localhost:8000.
- **With Railway**: Set `NEXT_PUBLIC_ICP_EXTRACTOR_URL` in `.env.local` to your Railway URL to test against the deployed API.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "You must specify a workspaceId to create a project" | Create an **Empty Project** first at [railway.app/new](https://railway.app/new), then add your GitHub repo as a service |
| ICP extraction fails on deployed site | Ensure `NEXT_PUBLIC_ICP_EXTRACTOR_URL` is set in repo variables and the Railway service is running |
| CORS errors | The Python app allows all origins; if issues persist, check Railway URL is correct |
| Extraction times out | Default timeout is 2 minutes; slow sites may need longer |
| Railway cold start | First request after idle may take 30–60s; subsequent requests are faster |
