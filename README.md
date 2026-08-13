# BUAI Builder Hub

Website for the USC Marshall × Viterbi BUAI Builder Hub (BBH).

## Local development

```bash
npm install
npm run dev
```

## Deploying to GitHub Pages

This repo already includes a GitHub Actions workflow (`.github/workflows/deploy.yml`)
that builds and deploys the site automatically every time you push to `main`.

### One-time setup

1. Create a new repo on GitHub (e.g. `bbh-website`) and push this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. On GitHub, go to your repo → **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. That's it. The workflow will run automatically and your site will be live at:

   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

Every future `git push` to `main` will redeploy the site automatically —
no manual build step needed.

### Manual deploy (alternative)

If you'd rather not use GitHub Actions, you can build locally and deploy the
`dist/` folder with the `gh-pages` package instead:

```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

Then set your repo's Pages source to the `gh-pages` branch.
