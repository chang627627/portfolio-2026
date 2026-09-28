# Chang Mou — Portfolio 2026

Product designer portfolio aimed at YC and AI-startup hiring. Static HTML/CSS/JS, no framework, dark, one typeface. Live at https://www.chang-mou.com (Vercel project `chang-mou-portfolio`, deploys on every push to `main` of github.com/chang627627/portfolio-2026, a public repo).

## How to use this file
- This file is the current state and the standing rules, kept short on purpose. The history behind them (every attempt, revert, measurement and quote, about 800 KB) lives in `.claude/notes/`, moved there word for word on 2026-09-27. The complete old file is `git show f7f52ee:CLAUDE.md`.
- Before changing an area, read its notes file (index at the end). For one element, grep all notes first, since entries often span areas: `grep -n -i 'whale' .claude/notes/*.md`.
- After a change: add a dated entry at the top of the matching notes file with the story (what was tried, the measurements, what he rejected, his words). Here, change only the state line or rule it affects, in a sentence or two, and add a line under "Settled" if something was rejected. Keep this file under 60 KB (`wc -c CLAUDE.md`).
- `.vercelignore` keeps this file and `.claude/` off the website. The GitHub repo is still public.

## Working with Chang
- Push only when he says push, and only if nothing changed after he said it. Commit in the session worktree, then push that commit to `main`.
- "Do" means build it on the real page. `?look=` previews only when he asks to explore or compare. Silence on an option is not approval: ask before keeping anything he did not pick.
- Small targeted changes, one at a time. If something I just built regresses, restore the last pushed version first, then fix it.
- Lead with my own measured read; keep agent runs short. Verify in the preview before reporting, and report plainly.
- Copy is judged by a YC/startup hiring reader; deliberate buzzwords stay ("first-principles").
- Visible copy: no em dashes (periods or commas), US spelling, compounds unhyphenated as on the cards ("AI powered", "pressure free", "Street level"), no award bragging in prose (badges and Recognition carry awards), work-card descriptions end without a period.
- A pair of screenshots, one broken and one clean: the clean one is the goal; remove the feature that caused the broken one.
- Images at maximum quality: 1920 wide (2x display), JPEG q90-100, PNG lossless or lossless WebP, never full-resolution exports. Every `<img>` gets width and height plus `height: auto` on the rule that sizes it.
- His other working preferences are in the auto-memory (`MEMORY.md`).

## What is live now

### Home (`index.html`)
- **Hero.** h1 "I'm Chang Mou." / "AI-first product designer." Line 2 is the site's only italic. The text is in the markup, `.hero-sr` carries it for screen readers, and glyph spans are added after `document.fonts.ready` with measured pair kerning. Size `clamp(48px, 7vw, 104px)`, tracking -0.04em. Sub: "4+ years shipping products across SaaS, AI, and social impact that balance user control with automation. I prototype in real code, this site included." Pill "Open to new opportunities" with a green dot: a mailto whose click copies the email and shows "Email copied" with a drawn check. Dawn gradient via the `.hero .hero-orbs--g2` override in index.html (yellow crown, coral core, violet, indigo base, azure and cyan glints on `blueFlow`); style.css still holds the old ramp, and `?look=original` restores it.
- **Hero motion** (desktop, fine pointer, motion-safe; phones get a fade-and-rise entrance and nothing else): glyphs wake left to right; an ambient specular light follows the gradient's own warm pool (`--g2-warm-x`) and the cursor adds light; a wake with a fast rise and a 1.1s decay; magnetic glyphs; an ignition beam at load that flares the pill's dot; Lightfall (the whole field leans toward the pointer, `ORB_X` 180, `ORB_Y` 26) with drag-the-light; the light releases and dims as the hero scrolls away while the field lags the scroll (`--g2-lift`). Stardust canvas: ambient weather that ignores the cursor, an updraft at open, colour sampled from the light field.
- **Ask the work** (desktop only, built by script, `ask-*` classes): a "Show me ___" line with a light crossing its rule only at rest, and chips All / AI agents / Award winners / Shipped / Web / Mobile & wearables. All shows no answer, and a × in the line (shown whenever something is asked or typed) or Escape returns to All; other chips and typed questions type an answer out word by word and fold the rows to the named projects. Typed questions go to `api/chat.js` (`surface: 'ask'`, streamed, third person, then "Answered by Claude"), ten per browser per day (`chat_usage`), with a tag fallback when the API fails. Answers can link to Play, About and the resume.
- **Work.** Desktop builds six editorial rows from the grid: Homewise · PollenNav · Countersign · StoryBloom · Coffee Chat · NOVA. Phones keep a six-card grid in the same order. The Mercor and New Craft Society cards are `display: none` with markup kept (New Craft lives on Play). Each row: a plate up to 840px in the product's own pastel (`--plate-light/deep/base` inline on each `<a class="project-card">`; cursor-lit on Homewise, PollenNav, Countersign and Coffee; NOVA and Mercor flat white; StoryBloom a full-bleed flat cover) holding the whole-interface still at 65%. Caption beside it: title `clamp(28px, 2.64vw, 38px)`, year at the row's end, 16px `--text-soft` description, and a hairline that a light travels along on hover. The chip row is hidden (`#work .card-meta { display: none }`).
- **Badges** top-left on the plates: PollenNav iF, Red Dot, NY Silver 2025, European; StoryBloom Red Dot 2026, NY Silver 2026; Coffee Chat Product Hunt #1; NOVA the CCA and UNICEF logos (20px desktop, 13px phones).
- **Row motion.** Hover and keyboard focus light the plate's own oklch hue glow (40px at 0.30 plus 96px at 0.14); the plate never moves. Rows enter with `card-arrive` and staggered caption pieces; the plate light sweeps as a row crosses; stills drift ±8px. Loops on desktop only, loaded while on screen: Homewise (a pan down the compare table), Countersign (a run to the gate, `countersign-loop-gate.webp`), NOVA (a turntable, ping-pong).
- The gap from the last content to the footer is 280px on desktop and 80px on phones, on every page.

### Footer (the ten pages with `.page-end`: every page except the decks, 404 and og-gen)
- `.page-end` holds the glow (the hero's dawn reflected, indigo at the top to amber at the bottom; the bottom stop stays warm), the `.say-hello` band (380px top padding on desktop, 180px on phones) and the bar.
- Stardust embers rise from the glow's edge and cool as they rise; the pointer is ignored. The one event: a humpback whale made of the same motes forms, swims across the band above "Say hello" (25s desktop, 16s phones, alternating direction), then lets go into dust. Its edge stays loose stipple.
- "Say hello" (desktop only): letter spans with an ambient light sweep plus a cursor spotlight limited to the word's box. A click copies the email and shows "Email copied"; the mailto is only the fallback.
- Bar: "© 2026 Chang Mou · Designed in the fog · 11:21 pm" (live San Francisco time, desktop only). Links: desktop LinkedIn / Email / GitHub / X; phones LinkedIn / Email / Resume / X.

### About (`about.html`)
- Desktop, motion-safe: the statement "I'm Chang Mou, a product designer / working on what AI can't design yet." (64px) is held by `position: sticky` and fades slowly in place; it never moves. Three lines then build under it one at a time: "Deciding what to build, / where a person stays in control, / and what is actually good enough to ship." (up to 54px; the current line white, spoken ones `--spoken` #2b2b2b). Under them a white and cream stardust galaxy (795 motes, a fixed canvas) tips and turns during the fade, then scatters, gathers into a ring and condenses into a star that flares and lifts, all driven by the scroll through one critically damped spring.
- Phones and reduced motion: no hold and no canvas. On phones the three calls live in the bio's first paragraph (`.bio-phone` and `.bio-wide` spans; edit both).
- Then: photos as a static 4x2 grid at every width; Background (four paragraphs: identity, method, conviction, personal; 16px `--text-soft`, full width); Experience, Education and Recognition as inline "name · detail · date" rows (company first, years only, no links); People I've worked with (three equal quotes, no boxes, hanging quote marks, one white clause each); Books I'm reading lately (six leaning hardcover covers, desktop only, no hover). "How I use AI" is hidden with an inline `display: none`. Lists and quotes arrive with `row-unfold` on desktop.

### Play (`play.html`)
- Statement "Where I explore new tools, experiment, and stretch my range as a generalist." It stays plain: the reveal and nothing else.
- Desktop (769px and wider with a mouse, checked live, so phones held sideways and narrowed windows never get it), motion-safe: a Canvas 2D prism under the statement during a one-screen sticky hold. It starts as a flat side view with a single line of light, then turns into 3D as you scroll while the light stretches into six rays; the exit face faces the viewer.
- Grid: from 1200px, three full-width columns of boxless cards showing title and year only, dealt by the script right after the grid from a title list (balanced within 1.5% from 1200 to 2560, each column ending on a film; a new card must be added to that list). Whisper XR and TickerPulse autoplay everywhere (an instant swap every 3.5s, the next slide decoded first; held on hover, Tab focus, off screen and while a detail page is open; none under reduced motion); in three columns their arrows and dots leave the grid. Below 1200, the markup's two masonry columns (`minmax(0, 1fr)`) with captions, within a few percent and both ending on a film. Phone order is independent, set by inline `--mo:N`. Visible: Scope, Octocrab, The Rib, Midjourney, Luma, Robot Operator Console, New Craft Society, TickerPulse*, Market Street Booklet Kit, Missing Pavilion, UN/FOLD, The Last Human Gestures, Vitruvian, Perfect Copy, No Signal Summer*, Whisper XR*, Futuristic Starship Cockpit, Fish Ocean, Mirror, Running Dog, About the Teddy Bear, I Believe in a Thing Called Love (* desktop only). Hidden with markup kept: Buffering Ocean, Golden Flux, Redbrick Coffee, Escape Velocity.
- In three columns the whole card (title included) opens its detail page: the lightbox as `.is-piece`, solid `--bg`, the work beside a 360px panel cloned from the card's caption and links (16 cards carry a longer introduction in a hidden `.play-more` after the caption, taken word for word from history; the panel shows it instead, the grid never does); multi-image pieces (Whisper XR, TickerPulse, Midjourney's six stills and three clips) step with previous/next and arrow keys, and a slideshow's detail page is separate from its card: it always opens on slide 1 and never moves the card (a Midjourney tile opens on itself); films wait paused on their poster under the glass play button. Below 1200 the lightbox is the image-only dialog that morphs out of the card. Films play in their card at every width (the YouTube cards are click-to-play facades with local posters); Robot Operator Console and Fish Ocean loop silently while on screen and play their film in place. Starship and Fish Ocean are films plus a "Play it here" link to the live app. No zoom cursors on Play. The Midjourney grid's stills load eagerly.

### Case studies
- Six linked studies in a circular previous/next chain, in home order: Homewise → PollenNav → Countersign → StoryBloom → Coffee Chat → NOVA → Homewise (`.case-nav`, a `div role="navigation"`; hover lights the title letter by letter toward the arrow). `ticker.html` is unlinked and noindex on purpose.
- Shared shape: the header wordmark reads "← Back" and goes to index.html; a contained `.case-cover`; the hero sub opens with the home card's first clause verbatim, then says something new; `.project-details`; a side rail (hidden at 1343px and below); back-to-top; a lightbox on images; width and height on every image; the Reflection h2 is a claim, never "What I learned".
- Side-nav spines:
  - Homewise: Problem · Insight · Why this is hard · Solution · Final Design · Design System · Process · Collaboration · Reflection · One more thing
  - PollenNav: Overview · Recognition · Problem · Research · Goals and challenges · Making the data readable · Approachable, not clinical · Usability Testing · Final Design · Reflection
  - Countersign: Problem · Insight · Why this is hard · Solution · Process · Final Design · Design System · Reflection
  - StoryBloom: Problem · Insight · The ritual · One night · Design language · Principles · Final Design · Try it live · Reflection
  - Coffee Chat: Overview · Problem · Research · Goals and constraints · Meaningful pairings · The user flow · What testing changed · Final Design · Design System · Reflection · What I'd do differently
  - NOVA: Overview · Problem · Solution · Research · HUD text · Independence vs tracking · The mascot · Usability Testing · Final Design · Reflection
- Facts that must stay true:
  - Homewise is framed as a prototype: Chang built the React prototype on the Hearth design system with Claude Code, and the dev team shipped the product. Its Tools list omits Figma. Each Final Design clip is followed by a `.hw-trade` tradeoff block. "View the prototype's code" sits at the end of Final Design; Collaboration has no button. The V2 coda links homewise-v2.vercel.app.
  - Countersign says its backend is mocked and deterministic. Captures come from github.com/chang627627/credit-analysis-agent; the design-system boards are crops of the live `/designsystem` page.
  - Coffee Chat: 63% and 200+ sit in Overview; the $4.5M figure is deck-only. The desktop-only "What I'd do differently" section embeds Luna (`/coffee-agent/`, source in `coffee-agent-src/`, free-text replies via `api/luna.js`).
  - StoryBloom was made by two designers with Chang leading (no name in the Team field). The live app is embedded on desktop only, so phones have no route to it.
  - NOVA's Final Design is three carousels. `#0094FF` is NOVA's accent and appears nowhere else.
  - PollenNav has no interactive prototype; never imply one.

### Decks (`coffeeslide` 21 slides, `homewiseslide` 36, `novaslide` 20, `countersignslide` 41)
- Standalone at clean URLs (vercel.json), linked from nowhere, not in the sitemap. Self-contained: inline CSS and JS, no style.css.
- One shared light system (the Hearth ramp: cream slides, an ink letterbox and ink bookends, one per-deck `--accent`), a 1920×1080 stage scaled to fit, and an editorial grammar (in-slide header row, JS folio, hairline stat rows, rule-topped columns, no boxed cards, one mid-deck ink slide).
- Comment mode (C) is shared through `api/comments.js` on the private Blob store, one immutable blob per comment. Pins are keyed by slide index, so inserting a slide moves them.

### Other files
`404.html` (absolute paths, dawn hero, no footer or chat) · `og-gen.html` (share-card source, noindex) · `style.css` (shared; `?v=278` on all 11 pages that load it) · `api/chat.js` (Ask the work and the hidden chat; its prompt holds the resume and projects) · `api/luna.js` · `api/comments.js` · `llms.txt` · `sitemap.xml` · `robots.txt` · `vercel.json` (clean-URL rewrites only) · `.vercelignore` · `fonts/` (Neue Montreal Regular, Medium and Italic, plus three unused OFL faces) · `hero-fluid.js` (the retired fluid gradient, not loaded).

## Design system
- Type: Neue Montreal, self-hosted `@font-face` in style.css (Fontshare delisted it), weight 400 everywhere; the one italic is hero line 2. Set `font-weight: 400` on every heading or browsers fake bold. Home size ladder: 104 hero, 38 titles, 16 body, 14, 13; new elements take a size from it.
- Color: background #0a0a0a, surface #1a1a1a, text #f0f0f0, `--text-soft` #a0a0a0 for long reads, `--text-muted` #888 for metadata. Chrome stays neutral: a white focus ring and a white-inversion selection.
- `--radius` 8px for controls and plates; circles only for dots and markers.
- Motion tokens: `--ease-out` cubic-bezier(0.16,1,0.3,1), `--dur-fast` 100ms, `--dur-base` 160ms, `--dur-slow` 400ms. Hovers answer in about 160ms; decorative travel stays slow on purpose. All motion is gated on `prefers-reduced-motion`, pointer effects on `(hover: hover) and (pointer: fine)`.
- Widths: a 960px measure for case studies and About, 1344px for the home rows and the two-column Play grid (three columns run full width); a 48px page inset on desktop, 24px on phones.
- Header (`nav:not(.side-nav)`): a full-width transparent 64px bar over a blur-and-scrim band (the scrim keeps the links legible over light images). Links 13px `--text-soft`; the current page is white by colour alone; a 1px underline grows only on hover.
- Anything on the fixed layer (back-to-top, the chat toggle) uses an opaque background.
- The hero and footer stardust share one mote (a 1.0-1.9px core with a 2.8x glow, soft bokeh, rare four-ray sparks); a surface may add physics or an event, never a different mote. The About galaxy's white and cream mote is the deliberate exception.
- Chang's AI, the floating chat, is hidden on every page by one rule at the top of the chat block in style.css; its markup and scripts remain.

## Settled: do not re-propose
Rejected or settled by Chang, most more than once. The reasons are in the notes.

**Site-wide**
- A second typeface of any kind (mono, serif or a pairing; four rejections, the last a thin serif like HW Cigars on 2026-09-28, previewed on the hero, then across the whole site, and ended both times: "ugly", "so torture"); heavier weights.
- Custom cursors; scroll friction, smooth scrolling or any wheel handling; grain or noise; "enterprise" line systems (rails, seams, measure grids, registration marks, dot grids, hairline row dividers); keyboard-shortcut chips; a light-mode toggle; bento layouts; logo walls; WebGL heroes (the Play prism is Canvas 2D and approved).
- Header: a resting underline on the current page; any glow or halo behind header text; page-specific header treatments; removing the blur-and-scrim band; a "Get in touch" CTA; a nav that condenses on scroll; wordmark redesigns.
- Tool credits ("Built with Claude Code") anywhere on the site. Bringing Chang's AI back unless he asks.
- View transitions beyond a plain root crossfade (no card-to-cover morph, no rise).
- Case studies: TL;DR or summary layers, numbered section labels, stated-principles lists, "show the win first" reorders. Work cards never link to GitHub repos. No overlays on work thumbnails other than award badges.

**Home hero**
- The copy is frozen. Any future line must pass three vetoes: it cannot be an actor-less fragment that reads as describing Chang; it cannot claim more than front-end prototyping ("I build what I design" failed); designer stays the identity, with code only as the closing clause. No clock or location line; no two-tone, bigger or brighter sub; don't raise the 104px cap.
- The dawn gradient stands: no geometry changes, no autonomous or fluid field (the field must answer the cursor), no further palette proposals unless he reopens it.
- The stardust stays ambient (`FOLLOW = false`); nothing is emitted at the cursor. No hero compression to pull work above the fold.

**Home work rows**
- The stills are frozen: the whole interface at 65% of the plate. No crops, zoom, resizing, or changes to shadow, corners, edges or the hover transform (four rejections).
- Every alternative arrangement is dead: stacking, pinning or folding (four tries), alternating sides, zig-zag, top-down, split captions, loose offsets, scatter, pairs, a work index, a 3D ring. Only behind `?look=`, and only if he reopens it.
- No colour under the caption at rest (the hover glow is the only light that leaves the plate). The space under the caption stays black: no diagrams, swatches, icons or toggles. The plate never lifts, rises or scales. No coloured or white rims.
- No "Selected work" header (deleted twice); no pre-footer line of any copy or animation (four removals); no point-of-view section; no inline year after the title; no chips turned into a line of text; no graphite plates, glass or shimmer on the pill, or blur on exit.
- Mercor: no cover artifact, write-up or page (NDA). It stays hidden.
- Ask the work: the chips stay and the row tags stay hidden (2026-09-28: tags back beside the chips read as repetition, and tags as the questions with a ghost line was "too noisy"; both reverted); no count, year range, key hint or label in its header; no numbers on the chips; no rainbow ring, sparkle, fake thinking step or floating dock; canned answers type out like Claude's; nothing outside its left edge; desktop only; the ten-a-day cap stays.

**Footer**
- "Say hello" stays; the band is the lever if the whale needs room. The dust ignores the pointer, and each surface gets one event. The whale stays loose and slightly abstract: no fills, outlines, halos, constellation lines, tonal or halftone shading, or eye twinkle, and no click or hover interaction with the whale or the word (15 concepts killed). No word-as-source dust, pixel dissolve or Pac-Man. No sea, water or swell under the whale (built in the bridge's place and rejected, 2026-09-27). No Golden Gate or other landmark (built and removed 2026-09-27: it read as SF-only to recruiters elsewhere, and a painted drawing broke the surface's own material). The footer line carries no tool credit or flavour.

**About**
- The photos stay a static 4x2 grid (the drum, carousel, pinned pass and their hovers are retired as "too fancy").
- Galaxy: white and cream only; the gather is a circle, not a disc or spiral; the whole galaxy shows on the first screen; the hold's length is settled. No lit answer line at load, no scroll cue of any kind, no per-line light sweep, no lead-in line above the three calls, no counter-translate on the statement, no second pinned section.
- Bio: 16px at full width (no 62ch cap), no motion or illumination, no origin story, no org names, no "agentic" identity claim, Figma and code described as separate systems; keep the five-item personal list.
- The credential lists stay inline rows (no year rail, column, grid or subgrid; two rejections), with no links and years only.
- Testimonials stay three equal quotes (no featured quote, no vantage labels).
- Books: no hover, motion, light, lamp or background tint (three interactions removed); at most six, as a rolling shelf.
- No Skills or Tools sections. The parallax kill list is in `about-hero.md` (curtains over text, fading text on release, text at fractional scroll rates, blur or mask reveals on text, pinned testimonials, a mote field behind text, holds on phones).

**Play**
- The statement stays plain: no hover type (three cancellations), dust, trail, halo, colour, or motion beyond the reveal.
- The prism is settled: six rays, their angles, the prism centred at 50% (moved from 44% on 2026-09-28 at his request), the beam's path. No dust-only version, continuous spectrum, physical-accuracy rework, ray spine or phone version.
- No 3D ring of the pieces (a hero object must not be built from the content below it), no pinned horizontal scroll, no left-aligned statement. Nothing runs live on the stage, and no "Run" disc (Fish Ocean became a film plus a "Play it here" link, like Starship). In three columns captions live only in the detail page (hover reveal, read-more expansion and a page per piece were set aside); the detail page is solid, never a veil; films never autoplay there; no zoom cursors anywhere on Play. The slideshows' autoplay just changes the image: no slide-in, fade or other effect, and nothing may jump. Detail-page introductions come only from his history, never invented; The Rib's never carries the Hebrew rib-means-side clause (cut twice), and Octocrab's paragraph he withdrew stays out unless he asks. No "Run the prototype" on the home rows. A caption never opens on its own card's title (a cited source, like the song on I Believe in a Thing Called Love, is fine). The Rib's caption never frames the woman as made from or for the man (one whole becomes two equals).

**Case studies and decks**
- NOVA's Final Design stays carousels, one frame at a time.
- PollenNav: no invented prototype link.
- Homewise: no principles list, no "The bet" section on the page, no separate human-in-the-loop section, no repo button in Collaboration.
- Countersign: no hypothetical ✕ column; never write "always" or "nothing" about its design system without checking the exceptions.
- StoryBloom is never "solo".
- coffeeslide: slides 5 and 7 stay as they are; no stats-recap close; no illustrations; Hello stays at slide 2. homewiseslide: no Hello slide, no "hardest call" or synthesis-map slides.
- The decks stay light with ink bookends; no multicolour progress bars.

## Open items (known, not fixed)
- The four decks still load Neue Montreal from Fontshare, which delisted it, so they render in the fallback font until they get their own `@font-face`. Thirteen other pages still carry the dead Fontshare `<link>` (harmless).
- Home overflows to 352px at a 320px viewport (`div.project-info`).
- `body.menu-open` does not lock scrolling (the flaw the lightbox had).
- About: the photos no longer land about 110px under the statement, as older notes claim; measure before relying on it.
- Footer, awaiting his call: the glow's amber hold never paints, a black band sits at the page bottom, and "Say hello" is under 3:1 at rest.
- coffeeslide still carries coffee.html's old Design System heading and a generic Reflection slide.
- The production deck-comments store holds six of Chang's own working notes on coffeeslide; deleting them needs his OK.
- Countersign's product repo: `design-preview.html` has stale typography labels and PlanReview lacks a focus style (fixes not pushed there).
- The live Homewise prototype still shows a "Task confidence" figure a prober could find.
- Coffee Chat's Product Hunt #1 belongs to the Litespace platform's 2023 launch, seven months before Coffee Chat shipped (flagged; his call).
- New Craft Society's Play cover is a placeholder, and its "Made with" line waits for him to name the stack.

## Workflow and tooling
- Preview: `.claude/launch.json` runs `python3 .claude/serve.py` (threaded, HTTP Range support, serves the worktree, 403s dotfiles). If the harness asks for `/tmp/portfolio/serve.py` (the stale primary checkout's config), recreate it as a copy of `.claude/serve.py` with ROOT set to the worktree; never rsync copies. `/api/*` does not run locally.
- Sessions run in worktrees. Never use a bare `git stash`. The primary checkout at `~/Desktop/portfolio 2026` is months stale; don't edit it.
- The post-push hook in `.claude/settings.json` fires only on `git push`. Its reminder means: log the story in the notes, one line here.
- A style.css change bumps `?v=` on all 11 pages that load it (`grep -oh 'style\.css?v=[0-9]*' *.html | sort | uniq -c` shows one value).
- Blocks pasted into every page: the footer stardust with the whale, "Say hello", the footer's local time, the chat widget, the lightbox. Edit one page, copy it verbatim, then confirm a single md5 across pages.
- Update together: `api/chat.js`'s prompt and `llms.txt` whenever projects or roles change. A new page needs GA4 (`G-RRQ4XH93F3`), a canonical, a sitemap entry, og and twitter meta (`og-image.jpg?v=6`), the favicon (`favicon.svg?v=4`), the font preload, the footer and chat blocks, and CreativeWork JSON-LD if it's a case study.
- Resume: Drive id `1CQdyuv-mrg4z3fl8lx9AjBogtB7nejsQ` in the nav and footer (21 links). Verify a new file with an anonymous `https://drive.google.com/uc?export=download&id=<ID>` fetch that returns `%PDF`.
- Share card: edit `og-gen.html`, render it with headless Chrome (`--force-device-scale-factor=2 --window-size=1200,630 --virtual-time-budget=6000`), `sips` it to a 1200×630 JPEG, bump `?v=`.
- Tools: PIL lives in `/usr/bin/python3`; there is no ffmpeg (use `avconvert` presets, and a Swift `AVAssetImageGenerator` for exact frame-0 posters); `puppeteer-core` in the scratchpad drives the installed Chrome (call `deFocus` before shots of apps that focus on mount); read PDFs with a small swiftc PDFKit program; `gh` and `jq` are installed. Pasted images can be recovered from the session JSONL as base64.
- The browser pane: rAF and IntersectionObserver stall while it isn't compositing (take a screenshot to wake it); `scroll-behavior: smooth` makes `scrollTo` animate (pass `behavior: 'instant'`); scroll-driven styles update a frame late (wait a double rAF); a running CSS transition outranks an inline `!important`; the pane can replay pointer events after a navigation; Chang shares it, so an unexplained change may be him.
- Before visual work, route through `.claude/skills/ui-skills/SKILL.md`. For portfolio feedback, use the rubric in `~/.claude/skills/portfolio-audit/SKILL.md` and say which suggestions are my own read.
- Serverless functions take 2-5 minutes to serve after a push; test `/api/*` on production.

## Traps that have bitten more than once
- Rules scoped to `.project-grid` stop matching on desktop, where the row builder moves the cards into `.feature`. Grep style.css before assuming a card effect works there.
- The header is scoped `nav:not(.side-nav)`; any new navigation landmark is a `div role="navigation"`.
- Never put `overflow-x: hidden` on `body` (it breaks every `view()` timeline). `html` clips instead, which hides overflow, so test `documentElement.scrollWidth > clientWidth`.
- Scroll-driven animation: use longhands with `animation-duration: auto`. An anonymous `view()` binds to the nearest scroll container, and any `overflow: hidden` ancestor is one, so use a named timeline. A sticky element freezes its own `view()`. Timeline animations fill outside their range, so two on one element must own different properties. Stacked animations on the hero orbs need index-aligned longhand lists.
- Width and height attributes need `height: auto` on the rule that sizes the image; compare the page height with the pre-change number. Horizontal auto margins on a flex item shrink it to its content.
- A canvas needs an explicit CSS width and height (`inset: 0` leaves it at its backing size, 2x on retina).
- Inside sticky or transformed stages, measure with `offsetTop`, never a rect plus `scrollY`. Never counter-translate anything against its own scroll; hold it with sticky or fixed.
- A hover transform must never move the element that carries `:hover`; move a child instead.
- A layer gated by IntersectionObserver that resets on exit must also reset whatever revealed it. Read `entries[entries.length - 1]`.
- Lazy images inside transformed slides never load, so the decks use eager images.
- `background-clip: text` on a parent paints over a child's opacity crossfade.
- A bare class loses to a selector like `.footer-links a` (0,1,1); scope visibility classes through the parent.
- `.project-img > img` owns the still's 65% width and drop shadow; a full-bleed image or clip must out-specify it, and a transparent PNG on a white plate needs real alpha.
- Downscaling a flat-colour PNG can make it bigger; compare the sizes.
- Scroll locks go on `document.documentElement`, not `body`.
- In the decks the stage is scaled, so measure with `offsetWidth` and `offsetHeight`. A `shot--crop` object-position is tuned to one capture and breaks when that capture is retaken.
- After renaming a section, compare the label with its own h2, and rename both the `side-nav-link` and the `section-label`.
- A queued recommendation can be invalidated by a later edit in the same session; re-check its premise before applying it.
- A text-decoration on a heading never reaches a button inside it; draw hover lines on the button. Moving a card with an iframe by append reloads the iframe; use `moveBefore` where it exists. A view's layout that must survive its close fade belongs on a class that outlives `.open`.

## Notes index (`.claude/notes/`)
| File | Covers |
|---|---|
| `home.md` | Home rows, cards, plates, badges, loops, images, the retired layouts |
| `ask.md` | Ask the work |
| `hero.md` | Home hero: copy history, gradient, stardust, light and type effects, the retired fluid field |
| `footer.md` | Glow, stardust, the whale, "Say hello", the footer line and links |
| `about.md` | About: photos, bio, lists, testimonials, books, How I use AI |
| `about-hero.md` | About: statement, answer lines, galaxy, scroll hold, the parallax research and kill list |
| `play.md` | Play grid, cards, videos, lightbox and stage, New Craft Society |
| `play-prism.md` | The prism |
| `play-statement.md` | The retired statement effects (hover type, stardust trails) |
| `site.md` | Tokens, fonts, the chat widget, style.css versions, 404, the API, the cursor and scroll-friction rejections |
| `header.md` | Header and nav |
| `passes.md` | Multi-page audit and craft passes |
| `case-studies.md` | Shared patterns, section spines, the previous/next chain, covers, back-to-top, TickerPulse |
| `homewise.md`, `countersign.md`, `coffee.md` (with Luna), `pollen.md`, `nova.md`, `storybloom.md` | Each case study |
| `homewiseslide.md`, `countersignslide.md`, `coffeeslide.md`, `novaslide.md` | Each deck |
| `decks.md` | The shared deck system and grammar |
| `dev.md` | Deployment, SEO, the share card, links, GitHub, dev notes |
| `preferences.md` | The original preferences list |
