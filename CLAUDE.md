# Chang Mou — Portfolio 2026

## Overview
Product designer portfolio. Static HTML/CSS/JS site (no framework). Dark mode, minimal, trendy 2026 aesthetic.

## Structure
- `index.html` — Home (hero + work grid)
- `about.html` — About (bio, experience, education, awards, skills)
- `play.html` — Play (experiments, side projects, video embeds)
- `style.css` — Shared styles across all pages

## Design Decisions
- **Font:** Neue Montreal (via Fontshare CDN) — single font across entire site
- **Color:** Dark mode (#0a0a0a background, #f0f0f0 text, #888 muted)
- **Hero animation:** Aurora gradient orbs (cursor-reactive) + text scramble reveal
- **Layout:** Two-column grid on about, masonry grid on play, 2-col project grid on home
- **Nav:** Work | Play | About | Resume | Get in touch

## Links
- LinkedIn: https://www.linkedin.com/in/chang-mou/
- Email: changmou627627@gmail.com
- Resume: https://drive.google.com/file/d/1P0ZSs_LHUvEtIRMHmnX3o-fHOVP9WX5P/view
- Vimeo (play page): https://vimeo.com/441663647

## Dev Notes
- No Node.js installed — pure static files
- Preview server serves from `/tmp/portfolio/` — sync files there after edits
- Cache-busting: `style.css?v=1` — bump version after CSS changes
