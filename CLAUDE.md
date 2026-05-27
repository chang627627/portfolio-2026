# Chang Mou — Portfolio 2026

## Overview
Product designer portfolio. Static HTML/CSS/JS site (no framework). Dark mode, minimal, trendy 2026 aesthetic.

## Structure
- `index.html` — Home (hero + work grid, 5 projects, 1344px content width). Work cards can link to internal case studies (coffee/pollen/ticker) or external live projects (StoryBloom → storybloom.tech/app, target="_blank").
- `about.html` — About (vertical layout: hero → photo collage → background → experience → education → awards → skills)
- `play.html` — Play (2-column masonry with card wrappers, lightbox on click, 11 projects)
- `coffee.html` — Coffee Chat case study
- `pollen.html` — PollenNav case study
- `ticker.html` — TickerPulse case study
- `nova.html` — UNICEF NOVA case study (linked from the home grid as of 2026-05-10). Visuals are pulled from the framer reference site at `aware-acknowledge-592065.framer.app/nova` and stored as `images/nova-*.png`.
- `style.css` — Shared styles across all pages

## Design Decisions
- **Font:** Neue Montreal (via Fontshare CDN) — single font, weight 400 (regular) everywhere
- **Color:** Dark mode (#0a0a0a background, #1a1a1a surface, #f0f0f0 text, #888 muted). **Accent blue:** `#0094FF` (matches the blue in NOVA's AR UI — sampled from `images/nova-hud-text-example.png`). Used for legend circles, the HUD Text "Selected" image border, and Solution Evaluation Matrix highlighted-row accent + tint. When adding new blue accents, reuse `#0094FF` (or `rgba(0, 148, 255, ...)` for transparent variants) so the page stays unified.
- **Blue scope:** `#0094FF` is the **NOVA case study's** accent (it matches the AR UI). It should NOT bleed into page chrome that lives across the site — e.g. the side-nav active-state indicator uses `var(--text)` (white) instead of the blue, so the chrome stays neutral while the case-study content keeps its own brand voice.
- **Radius:** 8px globally via `--radius` CSS variable
- **Max-width:** 960px for case study content sections (coffee/pollen/ticker). Home work grid and Play grid are 1344px for a wider workshop feel.
- **Nav:** Floating pill, 760px wide, glassmorphism blur (rgba(20,20,20,0.85)), centered. Links: Work | Play | About | Resume | Get in touch
- **Hero:** Animated mesh gradient (@property CSS) with blue (#4B8BFF), violet (#7B61FF), cyan (#00D4FF). Text scramble reveal + magnetic tilt. No cursor glow. Hire-state pill `.status-tag` below the subtitle reads "Open to new opportunities" with a `.status-dot` (green #4ade80, soft `pulse` animation that breathes opacity 0.7↔1.0 over 3s ease-in-out — deliberately *not* a scale+opacity blink; calm "alive" signal, not nervous). When Chang lands a role, swap the pill copy (e.g. "Open to interesting conversations") or remove `.status-tag` entirely.
- **Footer:** Big "Say hello" watermark (scroll reveal). Mesh gradient glow (static, no animation). overflow: hidden. Left line: "© 2026 Chang Mou · Built with Claude Code" (was "Designed in the fog" — moved here from the hero in 2026-05-14 so the hero could carry the hire-state signal). Right side: LinkedIn / Email / Resume.
- **Project cards:** #1a1a1a background, 1px solid rgba(255,255,255,0.08) border, border glow on hover (box-shadow), image zoom on hover. Title 18px, year 16px right-aligned, description 16px muted with 8px gap. Description reserves 2-line min-height so the tag row below aligns horizontally across cards even when one description fits in a single line.
- **Card meta chips:** `.card-meta` container holds 2–3 `.card-tag` chips below each project description. Tags are 11px uppercase, 1px stroke border (rgba 0.12), 4px radius, mute color (rgba 0.55). Pattern: `[Domain] · [Form factor] · [Status]` (e.g. `B2B SaaS · Dashboard · Shipped`, `Health · Mobile App · Award Winner`). Hidden on mobile (≤768px) since stacked cards already show full descriptions.
- **Card award badges:** `.card-awards` is an absolutely-positioned (top:12px, left:12px) flex row inside `.project-img`. Default badge height is 26px (`.card-awards img { height: 26px }`). PollenNav uses this default for its row of 4 horizontal-wordmark badges (iF, Red Dot, NY, European). **Override for lone portrait badges:** when a card has a single portrait-orientation badge (e.g. StoryBloom's NY Silver 2026 medallion), set `style="height: 30px"` inline on that img — the lone medallion reads too small against a single thumbnail at 26px because portrait badges have ~2.5× less surface area than landscape wordmarks at equal height. 30px brings the visible area into the same order of magnitude as the surrounding card content without going as bold as 32–38px (which made the badge feel larger than the matching NY 2025 sibling on PollenNav). Parent `.project-img` must have `position: relative` for absolute anchoring to work.
- **Chatbot:** Dark background, white icon, white rotating conic-gradient border (0.5 opacity).
- **Layout:** Vertical single-column on about, single-column on play, 2-col project grid on home
- **Mobile:** Hamburger menu → full-screen overlay. No footer watermark on mobile.
- **About photos:** 4x2 collage grid, square aspect ratio
- **Play projects:** 2-column flex masonry via `.play-column` children of `.play-grid`. Each project wrapped in `.play-card` (var(--surface) bg, 1px border, 20px padding, 8px outer radius). Image on top via CSS order, info block below with 20px margin-top on `.play-info`. Info block is `.play-info-top` (flex row: h3 left + `.play-year` muted 16px right, 8px margin-bottom) followed by `<p>` description. Pattern mirrors home page work cards. Inner image radius 4px (concentric with 8px card). Click images to zoom via lightbox. Whisper XR uses `.play-card--desktop-only` (hidden ≤768px). Carousel arrows sit below image in the dots row (bottom: 24px within 84px min-height dots area) — symmetric 24px spacing on both sides.
- **Play video clips:** Videos live in `images/` (no separate `videos/` folder). Markup pattern is `<video autoplay loop muted playsinline preload="metadata" style="…">` — `autoplay muted` is required for browsers to allow inline autoplay, `playsinline` keeps iOS from going fullscreen. Use the same `aspect-ratio:16/10;object-fit:cover;border-radius:8px` styling as the surrounding images so they sit in the same grid. The lightbox JS in `play.html` only handles `<img>`, so videos won't click-to-zoom — that's fine. Used in the Midjourney card to extend the 3-col still grid into a 3x3 grid where the bottom row is moving clips.
- **Case study patterns (shared):**
  - `.deliverable` — h2 caption + tight description above a full-width product image (Final Design walkthroughs on pollen.html and ticker.html, matches Coffee Chat Final Deliverables h2 style)
  - `.iteration-strip` — paired V1+V2 grid with full-width Final below (PollenNav Explorations)
  - `.voc-quotes` — 3-col grid of user quote cards with theme tag (TickerPulse Research)
  - `.pairing-annotated` — image left + annotation notes right with dashed arrows (Coffee Chat)
  - `.tool-cell` — name + small thumbnail in compare-table cells (Coffee Chat competitive analysis)
  - `.research-image-row` — flex row for 2+ research process images at the **same height but proportional widths**. Each `<figure>` has inline `style="flex: <aspect-ratio>"` (e.g. 1.14 / 1.35 / 1.66) and `flex-basis: 0`, so widths scale with each image's natural aspect ratio while heights stay equal. Each figure holds an `<img>` + a small muted center-aligned `<figcaption>` underneath as a label. Used in NOVA Research (field activities / interviews / affinity map).
  - `.problem-grid--stack` — 1-column variant of `.problem-grid`. Use when stacked full-width `.problem-card`s read better than 3 narrow cards — e.g. when the cards sit directly under a 3-image row and a 3-col grid would imply a 1:1 mapping that doesn't exist. Used in NOVA Research insights.
  - `.eval-matrix` (on `.compare-table`) — evaluation matrix table with `table-layout: fixed`, smaller padding/font, and a fixed 168px first column. Each cell pairs an `.eval-dot eval-dot--good/mid/bad` (8px circle, green/yellow/red — `#22C55E`/`#FACC15`/`#EF4444`) with the value text. Apply `.eval-row--highlight` to a `<tr>` to highlight the chosen approach (subtle blue tint `rgba(0,148,255,0.08)` + 2px `#0094FF` left accent on first cell). Used in NOVA Solution Evaluation Matrix.
  - `.comp-grid` — 2x2 image grid for competitive analysis (gap 16px, each image 16:9, center-aligned figcaption underneath). Stacks to 1 column under 768px. Used in NOVA Competitive analysis (Meta Orion / Snap Spectacles / Meta Ray-Ban / Apple Vision roadmap).
  - `.hud-grid` — 3x2 image+title+description grid for design exploration (e.g. HUD text styles). Title above image, image (16:9), description below. To highlight the chosen option, add `.hud-grid__item--selected` — applies a 3px `#0094FF` border + 1px rgba halo to **just the image** (not the whole card). Used in NOVA Challenge 1.
  - `.hud-example` — annotated example pattern: a numbered legend list (`.hud-example__legend` with `.hud-example__num` blue circles) placed **above** the image, with each `<li>` reading "[circle] **Label:** description." The matching numbered markers appear on the image itself. Used in NOVA Challenge 1 to walk through HUD Text in action.
  - `.phone-flow` — light-gray (`#E8E8E8`) panel matching the Companion app onboarding bg, holds 2–3 mobile screens in a 3-col grid (`.phone-flow__panel`). Each phone is wrapped in `.phone-flow__cell` (figure + dark `figcaption`) so labels sit **inside** the panel below the phone in small dark text. Used in NOVA Challenge 2 (Joint Onboarding / Safe Zone Setup / Safety Controls).
  - `.final-carousel` (on `.carousel` with `[data-carousel]`) — reuses the Whisper XR carousel pattern from `play.html` (`.carousel-track` / `.carousel-slide.active` / `.carousel-dots` / `.carousel-prev|next`) inside case-study Final Design sections. Modifier class only adds the standard 32px top-margin in `.project-content`; the carousel CSS is shared. The init JS (~25 lines: queries `[data-carousel]`, builds dots, wires prev/next click handlers) must be inlined in each page's script — there's no shared JS file. Used in NOVA Final Design (Companion app onboarding / Navigation mode / Freedom mode).
  - `.solution-diagram` — abstract system diagram for showing the product concept without real UI. CSS-only with two inline SVG glyphs (e.g. AR glasses + phone) flanking a dashed `#0094FF` connector with arrows. Each side has a label + small muted sub-label. Sits on a `.surface` panel. Used in NOVA Solution as a hero visual above the descriptive cards. Pattern: two abstract endpoints + bidirectional connector = "system with two parts that talk to each other."
  - `.partner-logos` — small partner-credit strip ("In collaboration with [logo] [logo]"). Logos render in **full original color at 60px CSS height** — no brightness/invert flatten, no opacity dim (changed 2026-05-11 per user; the brand colors carry signal). **Both logos must still be tight-cropped** so equal CSS `height` produces equal visible mark size — when a logo has internal padding (e.g. a tagline below the wordmark), the visible letters render smaller than the partner's at the same 60px box. Use `img.getbbox()` in PIL to verify the tight crop, or swap to a tighter-cropped source file. Used in NOVA Overview to credit CCA + UNICEF Innovation.
  - `.iter-example` — before/after iteration row (NOVA Usability Testing + Challenge 3). One `<h3>` title (optional), then 2-col grid with `<figure>` cells. Each cell: image + figcaption that starts with `<strong class="iter-example__mark iter-example__mark--bad|--good">Before:|After:</strong>`. The `::before` pseudo-element renders a red ✕ pill (`rgba(239,68,68,0.18)` bg + `#EF4444` text) or green ✓ pill (`rgba(34,197,94,0.18)` bg + `#22C55E` text) before the label. Two iter-examples stacked = paired before/after pattern from the framer reference. Also used in Challenge 3 (without mascot vs with mascot AR view).
  - `.mascot-exploration` — full-width figure for displaying the mascot character lineup. Inner `<img>` has `background: #E5E5E5` + padding so transparent-bg mascots render on a light gray "marketing display" panel matching the Companion app onboarding bg. Used in NOVA Challenge 3 below the before/after pair.
  - `.img-placeholder` (with `data-label` attribute) — dev-time placeholder for upcoming images. Dashed-border gray box with the label text from `data-label` shown via `::before`. Modifiers: `.img-placeholder--16-9` (AR view aspect), `.img-placeholder--mascot` (wide 16:7 panel). Swap with `<img>` once the real image lands.
- **Chat teaser:** Bottom-right tooltip bubble that fires 4s after page load (after hero status tag animation), shows "Hey, I'm Chang's AI. Ask me anything." Hides after 6s. Once-per-browser via localStorage. Hidden on mobile (≤768px).
- **Play lightbox:** Click any image inside a `.play-card` to expand. Dark 0.95 overlay, 8px radius close button (var(--radius)) with glassmorphism matching nav. Esc or click-outside to close.
- **Footer glow palette (Dusk):** violet rgba(100,70,220,0.2) + coral rgba(255,120,110,0.22) + purple rgba(140,90,230,0.12) + peach rgba(255,150,120,0.18). Matches hero palette at lower opacity for subtle warmth.

## Links
- LinkedIn: https://www.linkedin.com/in/chang-mou/
- Email: changmou627627@gmail.com
- Resume: https://drive.google.com/file/d/1z-tqSdPhGxQ3G0n6LHwy1gbi5O1VscmQ/view?usp=sharing
- X: https://x.com/changmou627 (added to footer 2026-05-14, all 7 pages)
- Vimeo (play page): https://vimeo.com/441663647, https://vimeo.com/486270690

## Deployment
- **Live URL:** https://www.chang-mou.com (custom domain via Squarespace DNS → Vercel)
- **Vercel URL:** https://chang-mou-portfolio.vercel.app
- **GitHub repo:** https://github.com/chang627627/portfolio-2026
- **Auto-deploy:** Push to `main` on GitHub triggers Vercel deploy automatically
- **Manual deploy:** `npx vercel --prod --yes` (from project folder)
- **`vercel.json` rewrites:** Used for clean URLs on specific pages (e.g., `/nova` → `/nova.html`). Add new rewrites here when a page needs an extension-free URL. Site-wide `cleanUrls: true` was avoided because it 301-redirects every `.html` URL and would break existing shared links.
- **Vercel project:** chang-mou-portfolio
- **Domain registrar:** Squarespace Domains (domains.squarespace.com)
- **Analytics:** Google Analytics 4 (Measurement ID `G-RRQ4XH93F3`) injected in `<head>` of all six HTML pages. Any new page needs the gtag snippet added.
- **Social share card:** `images/og-image.jpg` (1200x630, hero mesh gradient + tagline). Referenced via og: and twitter: meta tags on all six pages. New pages need the same meta block. **To regenerate:** edit `og-gen.html`, then run `node /tmp/og-snap.mjs` (Puppeteer at 1200x630 @ 2x DPI, piped through `sips -z 630 1200` to JPEG 95). Signed by "Chang Mou" bottom-right (not a URL — OG images aren't clickable).

## Dev Notes
- Node.js v24.14.0 installed via nodejs.org
- Preview server serves from `/tmp/portfolio/` — sync files there after edits
- Git initialized — commit before major changes
- Cache-busting: current `style.css?v=68` on play.html, v=48 on index.html — bump version after CSS changes. Keep version consistent per page.
- GitHub CLI: `/tmp/gh/gh_2.89.0_macOS_arm64/bin/gh` (not in PATH, use full path)
- Framer reference site: https://aware-acknowledge-592065.framer.app/
- Preview server: launched via `.claude/launch.json` (calls `python3 /tmp/portfolio/serve.py` on port 8888). The script `chdir`s to `/tmp/portfolio` before starting `http.server` to avoid getcwd permission errors. Sync files there after edits.
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

**Case study section order (May 2026):**
- Coffee Chat: Problem → Research → Design Goals → Constraints → Exploration 1/2 → Iteration 1/2 → Final Deliverables → Design System → Reflection. Final Deliverables sits after Iteration 2 so the payoff lands as the narrative climax once the process work is done.
- PollenNav: Problem → Research → Design Goals → Challenges → Exploration 1/2/3 → Usability Testing → Final Design → Reflection. Same logic — Final Design lands after Usability Testing so the validated design feels earned.
- TickerPulse keeps its original order (Background → Problem → Research → Solution → Final Design → Reflection). Its Solution block is a narrative bridge to the finals; moving Final Design would orphan it.
- UNICEF NOVA: Overview → Impact → Problem → Solution → Research → Ideation → Design Goals → Challenge 1 (HUD text) → Challenge 2 (Balancing safety with independence) → Challenge 3 (Nova mascot — making the experience engaging without distraction) → Usability Testing → Final Design → Reflection. Mirrors the framer reference: Solution sits right after Problem so the system is named early, then Research justifies it. Uses `.problem-grid--2col` modifier (CSS: `grid-template-columns: repeat(2, 1fr)`) for the two-card "For children / For parents" Solution layout. Each Challenge ends with a parent-quote in `.table-caption` style.
- Earlier (April 2026) we tried promoting Final Design to right after Research as a "show the win first" move. Reverted in May 2026 — the classic process-then-payoff arc reads stronger for these two case studies.

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
- Experience list top row updated 2026-05-11: was "Freelance · TickerPulse, HouSmart, CoPatible · 2026"; now "PM Accelerator · 2025 – Present" to match resume. Other rows (UNICEF / Litespace / Asset Layer / BC & Alberta Guide Dogs) are company-name only, so this row drops its project list to match that rhythm.
- Resume URL updated 2026-05-11 (new Google Drive file `1z-tqSdPhGxQ3G0n6LHwy1gbi5O1VscmQ`). Lives in nav + footer of all 7 HTML pages. Update via grep across `*.html` if it changes again.

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
- Copy targets a YC/startup hiring audience — keep resonant buzzwords like "first-principles thinking." Don't suggest cutting them as "designer-cliché." Judge phrases by the intended reader, not by general good-writing principles.
- Avoid decorative numbering (`01 — SELECTED WORK`, `01/02/03/04` card chips) on sections that don't have a real numbered series — implies an ordering that doesn't exist. Section labels can use the editorial hairline-rule treatment (`.section-meta` with `.section-label-text` + `.section-rule`) without the number.
- Don't put a 3-column image row directly above a 3-card grid when the images and cards aren't 1:1 related — readers will infer a mapping that doesn't exist. Either label each image (figcaptions) and switch the cards to a different shape (e.g. `.problem-grid--stack` for full-width stacked cards), or use a different image count.
- No motion on About → Skills + Tools chip rows. Tried a Bubbl-inspired stagger drop-in + hover wobble on 2026-05-11, reverted. The section is scan-and-leave, so constant micro-motion competes with readability instead of adding signal. Keep chips static; if motion is wanted, put it on hero or play-page surfaces instead.
- Date format conventions for `.exp-date` in Experience / Recognition / Education on about.html: single year (`2026`) = one-time award or event; comma list (`2025, 2026`) = multiple discrete wins of the same award in different years (e.g., NY Product Design Awards Silver — PollenNav 2025 + StoryBloom 2026); en-dash range (`2024 – 2025`) = continuous tenure or one award covering an academic year (e.g., Bernard Osher Scholarship). Don't mix — using a range for two discrete wins implies a continuous award; using a comma list for a continuous period implies two separate awards.
