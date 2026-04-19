# Chang Mou — Portfolio 2026

## Overview
Product designer portfolio. Static HTML/CSS/JS site (no framework). Dark mode, minimal, trendy 2026 aesthetic.

## Structure
- `index.html` — Home (hero + work grid, 5 projects, 1344px content width). Work cards can link to internal case studies (coffee/pollen/ticker) or external live projects (StoryBloom → storybloom-psi.vercel.app, target="_blank").
- `about.html` — About (vertical layout: hero → photo collage → background → experience → education → awards → skills)
- `play.html` — Play (2-column masonry with card wrappers, lightbox on click, 11 projects)
- `coffee.html` — Coffee Chat case study
- `pollen.html` — PollenNav case study
- `ticker.html` — TickerPulse case study
- `style.css` — Shared styles across all pages

## Design Decisions
- **Font:** Neue Montreal (via Fontshare CDN) — single font, weight 400 (regular) everywhere
- **Color:** Dark mode (#0a0a0a background, #1a1a1a surface, #f0f0f0 text, #888 muted)
- **Radius:** 8px globally via `--radius` CSS variable
- **Max-width:** 960px for case study content sections (coffee/pollen/ticker). Home work grid and Play grid are 1344px for a wider workshop feel.
- **Nav:** Floating pill, 760px wide, glassmorphism blur (rgba(20,20,20,0.85)), centered. Links: Work | Play | About | Resume | Get in touch
- **Hero:** Animated mesh gradient (@property CSS) with blue (#4B8BFF), violet (#7B61FF), cyan (#00D4FF). Text scramble reveal + magnetic tilt. No cursor glow. "Built with Claude Code" tag.
- **Footer:** Big "Say hello" watermark (scroll reveal). Mesh gradient glow (static, no animation). overflow: hidden. "Designed in fog" left, LinkedIn/Email/Resume right.
- **Project cards:** #1a1a1a background, 1px solid rgba(255,255,255,0.08) border, border glow on hover (box-shadow), image zoom on hover. Title 18px, year 16px right-aligned, description 16px muted with 8px gap.
- **Chatbot:** Dark background, white icon, white rotating conic-gradient border (0.5 opacity).
- **Layout:** Vertical single-column on about, single-column on play, 2-col project grid on home
- **Mobile:** Hamburger menu → full-screen overlay. No footer watermark on mobile.
- **About photos:** 4x2 collage grid, square aspect ratio
- **Play projects:** 2-column flex masonry via `.play-column` children of `.play-grid`. Each project wrapped in `.play-card` (var(--surface) bg, 1px border, 20px padding, 8px outer radius). Image on top via CSS order, info block below with 20px margin-top on `.play-info`. Info block is `.play-info-top` (flex row: h3 left + `.play-year` muted 16px right, 8px margin-bottom) followed by `<p>` description. Pattern mirrors home page work cards. Inner image radius 4px (concentric with 8px card). Click images to zoom via lightbox. Whisper XR uses `.play-card--desktop-only` (hidden ≤768px). Carousel arrows sit below image in the dots row (bottom: 24px within 84px min-height dots area) — symmetric 24px spacing on both sides.
- **Case study patterns (shared):**
  - `.deliverable` — h2 caption + tight description above a full-width product image (Final Design walkthroughs on pollen.html and ticker.html, matches Coffee Chat Final Deliverables h2 style)
  - `.iteration-strip` — paired V1+V2 grid with full-width Final below (PollenNav Explorations)
  - `.voc-quotes` — 3-col grid of user quote cards with theme tag (TickerPulse Research)
  - `.pairing-annotated` — image left + annotation notes right with dashed arrows (Coffee Chat)
  - `.tool-cell` — name + small thumbnail in compare-table cells (Coffee Chat competitive analysis)
- **Chat teaser:** Bottom-right tooltip bubble that fires 4s after page load (after hero status tag animation), shows "Hey, I'm Chang's AI. Ask me anything." Hides after 6s. Once-per-browser via localStorage. Hidden on mobile (≤768px).
- **Play lightbox:** Click any image inside a `.play-card` to expand. Dark 0.95 overlay, 8px radius close button (var(--radius)) with glassmorphism matching nav. Esc or click-outside to close.
- **Footer glow palette (Dusk):** violet rgba(100,70,220,0.2) + coral rgba(255,120,110,0.22) + purple rgba(140,90,230,0.12) + peach rgba(255,150,120,0.18). Matches hero palette at lower opacity for subtle warmth.

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
- **Analytics:** Google Analytics 4 (Measurement ID `G-RRQ4XH93F3`) injected in `<head>` of all six HTML pages. Any new page needs the gtag snippet added.
- **Social share card:** `images/og-image.jpg` (1200x630, hero mesh gradient + tagline). Referenced via og: and twitter: meta tags on all six pages. New pages need the same meta block. If the tagline changes, regenerate the card — the original generator was a temp html2canvas render at 1200x630.

## Dev Notes
- Node.js v24.14.0 installed via nodejs.org
- Preview server serves from `/tmp/portfolio/` — sync files there after edits
- Git initialized — commit before major changes
- Cache-busting: current `style.css?v=68` on play.html, v=48 on index.html — bump version after CSS changes. Keep version consistent per page.
- GitHub CLI: `/tmp/gh/gh_2.89.0_macOS_arm64/bin/gh` (not in PATH, use full path)
- Framer reference site: https://aware-acknowledge-592065.framer.app/
- Preview server: `npx serve` from `/tmp/portfolio/` — sync files there after edits
- Do not push to git unless user explicitly asks
- **Portfolio audit checker:** When the user asks for portfolio suggestions or feedback, reference the rubric from `~/.claude/skills/portfolio-audit/SKILL.md` (from https://github.com/hey-stefan/portfolio-audit). Cite which principle each suggestion comes from. When suggestions are personal interpretation rather than direct rubric items, say so explicitly.

## Recent audit-driven changes (April 2026)

**Coffee Chat:**
- Replaced Rule-Based vs ChatGPT-Enhanced table with annotated pairing card image (.pairing-annotated component with dashed arrow annotations)
- Added product thumbnails (Donut, Watercooler, Gather, Focusmate) to competitive analysis table via `.tool-cell`
- Tightened Exploration 1 and 2 paragraphs to 2 sentences each
- Kept `align` padding equal (48px) on design system and pairing image containers

**PollenNav:**
- Collapsed Exploration V1/V2/V3/Final sections into `.iteration-strip` (paired early versions + full-width Final)
- Merged 7 Final Deliverables subsections into a single Final Design walkthrough using `.deliverable` component (h2 captions, 1-sentence descriptions)
- Renamed Constraints section → "Challenges" with "Three challenges shaped the design direction" framing
- Rewrote Overview to "one billion people" hook (cut hero redundancy)
- Tightened What I Did from 4 generic bullets to 3 specific
- Sharpened Reflection to one project-specific insight about making invisible data tangible
- First deliverable heading establishes "Maya" (so subsequent "She..." captions have referent)
- Merged closing beat into walkthrough as final caption

**TickerPulse:**
- Added `.deliverable` captions for all 5 wireframes (Sign in, Dashboard, Watchlist, Alert, Trade)
- Replaced Pain Points table with 3 voice-of-customer quotes (`.voc-quotes` component) — Trust, Personalization, Timeliness themes
- Rewrote Background, What I Did, Problem, Solution, Reflection — all tighter, more specific
- Built competitive audit table (Bloomberg, TradingView, StockTwits, TickerPulse) with Source Linking + Explains Why columns (content accuracy verified via web search)
- First Final Design heading uses h2 style; section label stays on top

**About:**
- Hero tagline: "I'm Chang Mou, a product designer / shaping AI products with taste."
- Background trimmed from 3 generic paragraphs to 2 sharper ones (no buzzwords, no award-bragging)
- Keeps "Good design starts with a good life" as closing personality moment

**Homepage + infra:**
- Chat teaser bubble ("Hey, I'm Chang's AI...") fires 4s after page load (after status tag animates), hides after 6s, once-per-browser via localStorage, hidden on mobile
- Footer glow palette boosted (coral 0.13→0.22, peach 0.08→0.18) for more warmth alongside dominant purple/violet
- Award category labels updated on PollenNav (iF Branding & Communication, EPDA Information & Data, NYPDA Silver Winner)

**Play page complete redesign:**
- From single-column vertical to 2-column flex masonry with card wrappers
- Each project in `.play-card` (bg, border, padding) matching home page project card language
- Click-to-zoom lightbox with Esc/backdrop to close
- CoPatible and Luma added as new concept projects (from Figma Make work)
- Descriptions tightened (Whisper XR, Luma, CoPatible from 4 lines to 2)
- Inner image radius 4px for concentric feel with 8px card radius
- Carousel arrows below image, vertically aligned with dots, symmetric 24px spacing to image and title

## User preferences noted

- No em dashes in descriptive copy (prefers periods/splitting sentences)
- Do not brag about awards in copy; let the Recognition/Impact sections do that visually
- Keep "Play" as page name (not "Side") — matches the craft/experimentation signal the checker rewards
- Do not push to git unless explicitly asked
- Check sync to `/tmp/portfolio/` before screenshots (some resets happen)
- No category tags on play cards (denied this approach earlier)
- No accordion on play cards (tighten text instead of hiding it)
