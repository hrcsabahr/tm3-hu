# Design Concept 2025 — Tesla Model 3 (tm3.hu)

**Datum:** 2026-08-22
**Szerzo:** Jedi Szoftvermerok Mester
**Cel:** A jelenlegi "fekete-a-feketen, elavult" design levaltasa modern, kontrasztos, 2025-2026-os EV-grade UI-ra.

---

## 0. Kutatasi statusz (audit trail)

| # | Forras | Statusz |
|---|---|---|
| 1 | `https://www.tesla.com/tesla-3` | 403 Forbidden |
| 2 | `https://www.tesla.com/modely` | 403 Forbidden |
| 3 | DuckDuckGo kerdesek | CAPTCHA fal |
| 4 | Wayback Machine | 404 |
| 5 | Smashing Magazine | 404 |
| 6 | Behance | OK, nincs relevans szoveg |

A primer forrasok blokkolnak. A koncepcio a sandbox-ban elerheto `ux-redesign-p2.md` (12 967 byte) es a jelenlegi `styles.css` (23 156 byte) alapjan keszult, kiegeszitve a 2025-2026-os ipari trendekkel (Lucid, Polestar, Rivian R2).

---

## 1. Problema-diagnosztika

A `styles.css` eleje mutatja a fobb problemat:

```css
--color-bg: #FAFAF7;            /* off-white, kremes */
--color-bg-card: #FFFFFF;
--color-text: rgba(0, 0, 0, 0.95);
--color-text-muted: #615D59;
--color-accent: #0075DE;        /* "Notion + Stripe" editorial override */
```

**Problemak:**

1. **Brand-idegen paletta** — Notion/Stripe editorial stilus, nem Tesla.
2. **Nincs valodi dark mode** — csak override, nem rendszerszintu.
3. **AC akcent** — `#0075DE` (Notion-kek) tul hideg a Tesla premium erzesehez.
4. **Hero** — statikus, nincs scroll-driven storytelling.
5. **Specifikaciok** — szamok nincsenek kiemelve.
6. **CTA** — nincs primary/secondary hierarchia.
7. **Motion** — minimalis, nincs parallax vagy scroll-cue.

---

## 2. Design Vision (2025-2026)

Harom piller:

1. **Obsidian + Electric Edge** — sotet, de nem ures: obsidian (#0B0B0D) bazis + graphite (#1A1A1F) kartyak + electric white akcent a CTA-knak.
2. **Product-sculpture hero** — full-bleed auto-kep, finom gradient overlay, minimalis chrome.
3. **Stat-first storytelling** — teljesitmeny-szamok mono fontban, orias betuvel.

**Referenciak:**
- Tesla.com 2024-2025 redesign: full-bleed hero, sotet.
- Lucid Motors: sotet, premium, stat-first.
- Polestar 4: brutalist-tipografia + minimal chrome.
- Rivian R2 reveal: scroll-driven storytelling, sticky spec-kartyak.

---

## 3. Color System (token-alapu)

### 3.1 Core palette

| Token               | Hex        | Hasznalat                              | Kontraszt |
|---------------------|------------|----------------------------------------|-----------|
| `--bg-base`         | `#0B0B0D`  | Fo hatter (OLED-safe)                  | —         |
| `--bg-elevated`     | `#15151A`  | Kartyak, sticky nav                    | —         |
| `--bg-overlay`      | `#1F1F26`  | Modal, tooltip                         | —         |
| `--border-subtle`   | `rgba(255,255,255,0.08)` | Elválasztók                  | —         |
| `--border-strong`   | `rgba(255,255,255,0.16)` | Input-keretek                | —         |
| `--text-primary`    | `#F5F5F7`  | Headline, spec szam                    | 16.8:1 AAA |
| `--text-secondary`  | `#B8B8C2`  | Body szoveg                            | 8.9:1 AAA |
| `--text-tertiary`   | `#7C7C88`  | Caption, meta                          | 4.6:1 AA  |
| `--accent-primary`  | `#FFFFFF`  | CTA fill                               | —         |
| `--accent-contrast` | `#0B0B0D`  | CTA szoveg                             | 17:1 AAA |
| `--accent-glow`     | `rgba(120,180,255,0.15)` | Hover halo                | —         |
| `--semantic-ok`     | `#3DDC97`  | Pozitiv feedback                       | —         |
| `--semantic-warn`   | `#FFB454`  | Figyelmeztetes                         | —         |
| `--semantic-err`    | `#FF5C5C`  | Hiba                                   | —         |

### 3.2 Gradient overlays

```css
--gradient-hero: linear-gradient(180deg,
    rgba(11,11,13,0) 0%,
    rgba(11,11,13,0.4) 55%,
    rgba(11,11,13,0.92) 100%);
--gradient-glow: radial-gradient(ellipse at center,
    rgba(120,180,255,0.12) 0%,
    rgba(11,11,13,0) 60%);
```

---

## 4. Typography (fluid scale)

### 4.1 Font stack

```css
--font-display: "Inter Tight", "SF Pro Display", -apple-system, "Helvetica Neue", Arial, sans-serif;
--font-body:    "Inter", "SF Pro Text", -apple-system, "Helvetica Neue", Arial, sans-serif;
--font-mono:    "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
```

### 4.2 Type scale

| Role          | Token             | clamp                              | Weight | Tracking |
|---------------|-------------------|------------------------------------|--------|----------|
| Hero H1       | `--type-hero`     | `clamp(3rem, 8vw, 6rem)`           | 700    | -0.04em  |
| Section H2    | `--type-section`  | `clamp(2rem, 4vw, 3.25rem)`        | 600    | -0.025em |
| Spec Number   | `--type-stat`     | `clamp(3.5rem, 7vw, 5.5rem)`       | 700    | -0.045em |
| Body L        | `--type-body-lg`  | `clamp(1.0625rem, 1.3vw, 1.25rem)` | 400    | -0.01em  |
| Body M        | `--type-body`     | `1rem`                             | 400    | 0        |
| Caption       | `--type-caption`  | `0.8125rem`                        | 500    | 0.02em   |
| CTA           | `--type-cta`      | `0.9375rem`                        | 600    | 0.005em  |
| Eyebrow       | `--type-eyebrow`  | `0.75rem`                          | 600    | 0.18em (UPPERCASE) |

---

## 5. Spacing & Layout

```css
--space-3xs: 0.25rem;   /* 4px */
--space-2xs: 0.5rem;    /* 8px */
--space-xs:  0.75rem;   /* 12px */
--space-sm:  1rem;      /* 16px */
--space-md:  1.5rem;    /* 24px */
--space-lg:  2rem;      /* 32px */
--space-xl:  3rem;      /* 48px */
--space-2xl: 4.5rem;    /* 72px */
--space-3xl: 6.5rem;    /* 104px */
--space-section: clamp(4rem, 8vw, 8rem);
--container-max: 1280px;
--container-pad: clamp(1.25rem, 4vw, 2.5rem);
```

**Layout elvek:**
- 12-col fluid grid (CSS Grid), gap: var(--space-md).
- Max-width 1280, hero full-bleed (100vw).
- Section vertikalis padding: clamp(4rem, 8vw, 8rem).

---

## 6. Komponensek

### 6.1 Sticky nav

- 64px magas, `backdrop-filter: blur(20px) saturate(180%)`.
- Alap: `rgba(11,11,13,0.6)` → scroll utan: `rgba(11,11,13,0.92)`.
- Logo (balra): minimalist "T" mark, 28px.
- Linkek (jobbra): "Modellek", "Charging", "Szerviz", "Rolunk" — 14px, `--text-secondary`, hover: `--text-primary`.
- CTA jobb szelso: "Rendeles" — kisméretű, secondary style.

### 6.2 Hero

```
+---------------------------------------------------+
| [sticky nav]                                      |
|         (full-bleed auto kep, sotet)              |
|         2025 · MAGYARORSZÁG  (eyebrow)            |
|         Model 3                       (H1, 6rem)  |
|         Built for electric performance.           |
|         [ Rendeles ]  [ Felfedezés ]              |
|         11 490 000 Ft  ·  Szállítás: 2026 Q4      |
|                              [ v scroll-cue ]     |
+---------------------------------------------------+
```

### 6.3 Stat-block

```html
<article class="stat">
    <span class="stat__num">5.8<small>s</small></span>
    <span class="stat__label">0-100 km/h</span>
</article>
```

- 3-as grid (desktop), stacked (mobile).
- Szamok: mono font, `--type-stat`, `--text-primary`.
- Label: caption, `--text-tertiary`, UPPERCASE, tracking 0.18em.

### 6.4 CTA gombok

```css
.btn-primary {
    background: var(--accent-primary);
    color: var(--accent-contrast);
    padding: 14px 28px;
    border-radius: 999px;
    font: 600 0.9375rem/1 var(--font-body);
    transition: transform .2s, box-shadow .2s;
}
.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(255,255,255,0.12);
}
.btn-secondary {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-strong);
}
```

### 6.5 Card

- `background: var(--bg-elevated)`.
- `border: 1px solid var(--border-subtle)`.
- `border-radius: 16px`.
- Padding: `var(--space-lg)`.
- Hover: `border-color: var(--border-strong)`, `translateY(-2px)`.

---

## 7. Motion rendszer

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--t-fast: 150ms;
--t-base: 240ms;
--t-slow: 480ms;
```

**Scroll-driven elemek:**

1. **Hero parallax** — kep `translateY(calc(var(--scroll) * 0.3))`.
2. **Fade-in sections** — IntersectionObserver, opacity 0->1 + translateY 24->0, 480ms.
3. **Stat counter** — lathatosag utan 0-rol cel-ertekre (1.2s, ease-out).
4. **Sticky nav morph** — top: transparent; scroll > 80px: solid + border.
5. **Card hover** — scale(1.02) + glow halo.

**Reduced-motion fallback:**
```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## 8. Oldal-struktura

1. **Hero** — Model 3 + 2 CTA + ar + scroll-cue.
2. **Performance** — 0-100, hatotav, top-speed stat-blockok.
3. **Range & Charging** — WLTP, Supercharger terkep, toltesi ido.
4. **Interior** — minimalis belter, 15.4" kijelzo.
5. **Safety** — 5-star Euro NCAP, Active Safety.
6. **Specs comparison** — SR / LR / Performance tablazat (sticky header).
7. **Total Cost of Ownership** — TCO kalkulator.
8. **Szerviz & Hibak** — magyarorszagi szervizek + gyakori hibak.
9. **Toltok** — Supercharger + destination charger lista.
10. **Blog** — legfrissebb hirek.
11. **Footer** — disclaimer, contact, social.

---

## 9. Implementacios utemezes (3 sprint)

### Sprint 1 — Token rendszer + Hero (1-2 nap)
- `assets/css/tokens.css` letrehozasa.
- `assets/css/base.css` — reset, body, html, scroll-behavior.
- `styles.css` refaktor: override-ok torlese, token-ek hasznalata.
- Hero HTML + CSS ujrairas.

### Sprint 2 — Section komponensek (2-3 nap)
- Section-header komponens.
- Stat-block komponens.
- Card rendszer.
- Performance + Range + Interior sectionok.

### Sprint 3 — Motion + Polish (1-2 nap)
- IntersectionObserver fade-in.
- Stat counter animation.
- Sticky nav morph.
- Reduced-motion fallback.
- Lighthouse audit + a11y (cél: 95+ minden kategoriában).

---

## 10. KPI

| Mertek | Cel |
|---|---|
| Lighthouse Performance | 95+ |
| Lighthouse Accessibility | 95+ |
| LCP | < 2.5s |
| CLS | < 0.1 |
| CTA konverzio | +20% |
| Bounce rate (hero) | < 40% |
| Avg. session duration | +30% |

---

## 11. Kovetkezo lepes

Jovahagyas utan **Sprint 1** indul: token-rendszer + Hero atiras.
A `styles.css` elejen levo `Editorial override` blokk torlesre kerul.
Az auto-kep optimalizalasahoz AVIF/WebP fallback is megoldando (`assets/img/`).

---

*"Az Ero ebben a redesignban van — sotet, mint az obsidian, fenyes, mint a villam."*
