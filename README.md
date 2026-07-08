# Roth6900

Satirical meme-coin landing page — "the first Roth IRA memecoin on the Robinhood Chain." A retirement-form / tax-prospectus themed single page built with React, Vite, Tailwind CSS, and GSAP scroll animations.

> Parody only. Not affiliated with Robinhood, SPX6900, or the IRS. Not a Roth IRA, not financial advice.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) (ScrollTrigger reveal animations)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to /dist
npm run preview  # preview the production build locally
```

## Deploying to Vercel

This is a standard Vite app, so Vercel auto-detects it. Either:

- **Dashboard:** import the repo, framework preset **Vite**, build command `npm run build`, output dir `dist`.
- **CLI:**

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

## Customizing launch values

All copy and launch placeholders live at the top of `src/App.jsx` in the `token`, `socials`, and related data objects (contract address, buy/swap/bridge/chart URLs, ticker, supply, etc.). Replace the `TBA` / `#` placeholders with real values when launching.

## Project structure

```
index.html               # app shell + favicon + meta
src/main.jsx             # React entry
src/App.jsx              # all sections, data, and inline SVG artwork
src/index.css            # fonts, Tailwind layers, custom paper/animation utilities
tailwind.config.js       # brand colors, fonts, max-width, shadow tokens
public/roth6900-mark.svg # favicon mark
```
