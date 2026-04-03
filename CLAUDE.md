# Chang Mou — Portfolio 2026

## Overview
Product designer portfolio. Static HTML/CSS/JS site (no framework). Dark mode, minimal, trendy 2026 aesthetic.

## Structure
- `index.html` — Home (hero + work grid, 4 projects)
- `about.html` — About (vertical layout: hero → photo collage → background → experience → education → awards → skills)
- `play.html` — Play (video embeds + image projects, single column)
- `style.css` — Shared styles across all pages

## Design Decisions
- **Font:** Neue Montreal (via Fontshare CDN) — single font, weight 400 (regular) everywhere
- **Color:** Dark mode (#0a0a0a background, #1a1a1a surface, #f0f0f0 text, #888 muted)
- **Radius:** 8px globally via `--radius` CSS variable
- **Max-width:** 960px for all content sections (standard width)
- **Nav:** Floating pill, 760px wide, glassmorphism blur (rgba(20,20,20,0.85)), centered. Links: Work | Play | About | Resume | Get in touch
- **Hero:** Animated mesh gradient (@property CSS) with blue (#4B8BFF), violet (#7B61FF), cyan (#00D4FF). Text scramble reveal + magnetic tilt. No cursor glow. "Available for work" green dot tag.
- **Footer:** Big "Say hello" watermark (scroll reveal). Mesh gradient glow (static, no animation). overflow: hidden. © 2026 left, LinkedIn/Email/Resume right.
- **Project cards:** #1a1a1a background, 1px solid rgba(255,255,255,0.08) border, border glow on hover (box-shadow), image zoom on hover. Title 18px, year 16px right-aligned, description 16px muted with 8px gap.
- **Chatbot:** Dark background, white icon, white rotating conic-gradient border (0.5 opacity).
- **Layout:** Vertical single-column on about, single-column on play, 2-col project grid on home
- **Mobile:** Hamburger menu → full-screen overlay. No footer watermark on mobile.
- **About photos:** 4x2 collage grid, square aspect ratio
- **Play projects:** 960px wide, 96px gap between projects, title+description above media

## Links
- LinkedIn: https://www.linkedin.com/in/chang-mou/
- Email: changmou627627@gmail.com
- Resume: https://drive.google.com/file/d/1P0ZSs_LHUvEtIRMHmnX3o-fHOVP9WX5P/view
- Vimeo (play page): https://vimeo.com/441663647, https://vimeo.com/486270690

## Deployment
- **Live URL:** https://www.chang-mou.com (custom domain via Squarespace DNS → Vercel)
- **Vercel URL:** https://chang-mou-portfolio.vercel.app
- **GitHub repo:** https://github.com/chang627627/portfolio-2026
- **Auto-deploy:** Push to `main` on GitHub triggers Vercel deploy automatically
- **Manual deploy:** `npx vercel --prod --yes` (from project folder)
- **Vercel project:** chang-mou-portfolio
- **Domain registrar:** Squarespace Domains (domains.squarespace.com)

## Dev Notes
- Node.js v24.14.0 installed via nodejs.org
- Preview server serves from `/tmp/portfolio/` — sync files there after edits
- Git initialized — commit before major changes
- Cache-busting: `style.css?v=14` — bump version after CSS changes
- GitHub CLI: `/tmp/gh/gh_2.89.0_macOS_arm64/bin/gh` (not in PATH, use full path)
- Framer reference site: https://aware-acknowledge-592065.framer.app/
- Preview server: `npx serve` from `/tmp/portfolio/` — sync files there after edits
- Do not push to git unless user explicitly asks
