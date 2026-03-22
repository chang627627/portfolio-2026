# Chang Mou — Portfolio 2026

## Overview
Product designer portfolio. Static HTML/CSS/JS site (no framework). Dark mode, minimal, trendy 2026 aesthetic.

## Structure
- `index.html` — Home (hero + work grid, 6 projects)
- `about.html` — About (vertical layout: hero → photo collage → background → experience → education → awards → skills)
- `play.html` — Play (video embeds + image projects, single column)
- `style.css` — Shared styles across all pages

## Design Decisions
- **Font:** Neue Montreal (via Fontshare CDN) — single font, weight 400 (regular) everywhere
- **Color:** Dark mode (#0a0a0a background, #f0f0f0 text, #888 muted)
- **Radius:** 8px globally via `--radius` CSS variable
- **Max-width:** 960px for all content sections (standard width)
- **Nav:** Floating pill, 760px wide, glassmorphism blur, centered. Links: Work | Play | About | Resume | Get in touch
- **Hero:** Aurora gradient orbs (cursor-reactive) + text scramble reveal + cursor glow + magnetic tilt. "Available for work" green dot tag.
- **Footer:** Big "Chang Mou" watermark (scroll reveal, fades into footer). © 2026 left, LinkedIn/Email/Resume right.
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
- **Live URL:** https://chang-mou-portfolio.vercel.app
- **Deploy command:** `npx vercel --prod --yes` (from project folder)
- **Vercel project:** chang-mou-portfolio (linked via CLI login with Gmail)

## Dev Notes
- Node.js v24.14.0 installed via nodejs.org
- Preview server serves from `/tmp/portfolio/` — sync files there after edits
- Git initialized — commit before major changes
- Cache-busting: `style.css?v=1` — bump version after CSS changes
