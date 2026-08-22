# UX/UI Redesign Proposal — Tesla Model 3 Landing Page (P2)

> **Phase**: P2 — Design Proposal
> **Input**: P1 audit output (information architecture, content gaps, accessibility baseline)
> **Goal**: Modern, Tesla.com-grade dark theme redesign — visual language, tokens, hero section
> **Status**: Design document only. **No production code in this phase.**

---

## 1. Design Vision

A redesign celja, hogy a Model 3 landing page a **mai Tesla.com vizualis nyelvehez** igazodjon: full-bleed, hero-dominans, minimalis, sotet tonusu felulet, amely a jarmuvet "termek-szobor" modjara mutatja be. A tartalom hierarchiaja egyertelmu: **kep ural → headline → specifikacio → CTA**.

Harom vezerelv:

1. **Product-first** — a kep a foszereplo, az UI eltunik mogotte.
2. **Quiet confidence** — visszafogott tipografia, nagy betukoz, kontrasztos CTA.
3. **Performance storytelling** — a szamok (0–100, hatotav, toltesi ido) legyenek azonnal olvashatok.

---

## 2. Reference Audit (Tesla.com current style)

A `web.archive.org` 2025-01-01 snapshot alapjan a Tesla.com Model 3 oldal a kovetkezo jellemzőket mutatja:

- **Hatter**: tulnyomoreszt sotet (fekete / very-dark-grey), a hero kepek termeszetesen sotet tonusuak.
- **CTA-k**: "Order Now", "Experience Model 3", "Compare", "Trade In" — letisztult, minimalis gombok, alacsony vizualis sullyal.
- **Layout**: full-bleed hero, fuggolegesen scrollozhato "section blocks" (Performance / Range / Charging / Interior).
- **Brand voice**: rovid, magabiztos, technikai precizitas.

Ezt a vizualis nyelvet vesszuk at, de modernizaljuk:
- reszponziv fluid layout,
- design token-rendszer (CSS variables),
- motion / micro-interaction guidance,
- accessibility-first kontrasztok.

---

## 3. Color Palette (Dark Theme)

A paletta a Tesla "obsidian black" alapszinere epit, de kiegeszul egy **soft graphite** kozeptonussal es egy **electric white** akcentussal a CTA-k szamara.

### 3.1 Core tokens

| Token              | Hex       | RGB              | Hasznalat                                          |
| ------------------ | --------- | ---------------- | -------------------------------------------------- |
| `--bg-base`        | `#0B0B0D` | 11, 11, 13       | Globalis hatter (deep obsidian)                    |
| `--bg-elevated`    | `#15151A` | 21, 21, 26       | Card / spec panelek                                |
| `--bg-overlay`     | `#1C1C22` | 28, 28, 34       | Modal, sticky header scrolled state                |
| `--surface-line`   | `#2A2A33` | 42, 42, 51       | Hairline divider, card border                      |
| `--text-primary`   | `#F5F5F7` | 245, 245, 247    | Headline, fontos szamok                            |
| `--text-secondary` | `#B8B8C2` | 184, 184, 194    | Body copy, leirasok                                |
| `--text-muted`     | `#6E6E7A` | 110, 110, 122    | Metaadatok, labjegy                                |
| `--accent-primary` | `#FFFFFF` | 255, 255, 255    | Fo CTA (Order Now) — Tesla "shop" gomb stilus      |
| `--accent-red`     | `#E31937` | 227, 25, 55      | Performance akcent (0–100 km/h badge, teszt link)  |
| `--accent-glow`    | `#3B82F6` | 59, 130, 246     | Hover / focus glow (soft blue, accessibility safe) |

### 3.2 Szinhasznalati szabalyok

- **Maximum 1 akcent szin / kepernyo**. A teljesitmeny-specifikaciok oldalan piros, az interior / range oldalon semleges.
- **Soha ne hasznaljunk tiszta fekete (#000)** — a `--bg-base` `#0B0B0D`, mert a true-black vibrálast okoz OLED-en es tul kontrasztos a tipografiával.
- **CTA kontraszt**: `--accent-primary` (feher) gomb szovege mindig `--bg-base`. Kontraszt arany: **17:1** (AAA).
- **Gradient overlay**: hero kepeken linearis gradient `rgba(11,11,13,0) → rgba(11,11,13,0.85)` alulrol, hogy a headline olvashato maradjon.

---

## 4. Typography

A Tesla a sajat "Tesla Typography" (Grotesk-alapu) rendszert hasznalja; web-safe alternativakent egy modern grotesk stacket javaslok, amely minden operacios rendszeren elerheto.

### 4.1 Font stack

```
--font-display: "Inter", "SF Pro Display", -apple-system, "Helvetica Neue", Arial, sans-serif;
--font-body:    "Inter", "SF Pro Text", -apple-system, "Helvetica Neue", Arial, sans-serif;
--font-mono:    "JetBrains Mono", "SF Mono", Menlo, monospace;   /* spec szamokhoz */
```

### 4.2 Type scale (fluid, clamp-based)

| Role        | Token                  | clamp(min, preferred, max)        | Weight | Tracking |
| ----------- | ---------------------- | --------------------------------- | ------ | -------- |
| Hero H1     | `--type-hero`          | `clamp(2.5rem, 6vw, 5rem)`        | 600    | -0.03em  |
| Section H2  | `--type-section`       | `clamp(1.75rem, 3.5vw, 3rem)`     | 600    | -0.02em  |
| Spec Number | `--type-stat`          | `clamp(3rem, 5vw, 4.5rem)`        | 700    | -0.04em  |
| Body L      | `--type-body-lg`       | `clamp(1.0625rem, 1.2vw, 1.25rem)`| 400    | -0.01em  |
| Body M      | `--type-body`          | `1rem`                            | 400    | 0        |
| Caption     | `--type-caption`       | `0.8125rem`                       | 500    | 0.02em   |
| CTA         | `--type-cta`           | `0.9375rem`                       | 600    | 0        |

### 4.3 Tipografiai szabalyok

- **Hero H1**: mindig rovid (≤ 4 szo), pl. "Model 3". Soha ne legyen teljes mondat.
- **Spec szamok** (3.1s, 510 km, 250 kW): tabular-nums, mono fallback, hogy a szamjegyek azonos szelesseguek legyenek.
- **CTA uppercase**: ne. A Tesla ujabb design nyelve sentence-case, pl. "Order now", "Compare".
- **Line-height**: display 1.05–1.1, body 1.5, caption 1.4.

---

## 5. Hero Section Proposal

A hero a teljes redesign legfontosabb eleme. Az alabbi specifikacio a P3 implementacio alapja.

### 5.1 Layout (desktop ≥ 1280px)

```
┌──────────────────────────────────────────────────────┐
│  [sticky top nav — semi-transparent, blur 12px]      │
├──────────────────────────────────────────────────────┤
│                                                      │
│                                                      │
│                                                      │
│             [Full-bleed car render]                  │
│              side-front 3/4 view                     │
│              gradient overlay bottom                 │
│                                                      │
│                                                      │
│   Model 3                                            │
│   Built for electric performance.                    │
│                                                      │
│   ┌────────────┐  ┌────────────┐                     │
│   │ Order now  │  │ Experience │                     │
│   └────────────┘  └────────────┘                     │
│                                                      │
│   $39,990  •  Est. delivery Mar 2026                 │
├──────────────────────────────────────────────────────┤
│   [down chevron — scroll cue]                        │
└──────────────────────────────────────────────────────┘
```

### 5.2 Layout (mobile < 768px)

- Hero kep **felso 60%**, szoveg es CTA **also 40%**, 24px padding.
- A kep `object-fit: cover`, `object-position: center 30%` (az auto "orrot" tartja keretben).
- A CTA-k teljes szelessegue valnak (full-width stacked).

### 5.3 Hero komponensek

| # | Komponens          | Leiras                                                                 |
| - | ------------------ | ---------------------------------------------------------------------- |
| 1 | Sticky nav         | Logo balra, jobbra: "Shop", "Account", "Menu". 64px magas, blur 12px.  |
| 2 | Car render         | `<picture>` responsive AVIF/WebP, multiple sizes via `srcset`.         |
| 3 | Gradient overlay   | Linear bottom, 0% → 85% opacity, csak mobil es tablet eseten.          |
| 4 | Headline           | "Model 3", `--type-hero`, `--text-primary`.                            |
| 5 | Subhead            | "Built for electric performance." max-width 540px.                     |
| 6 | CTA cluster        | Primary: "Order now" (white fill, black text). Secondary: "Experience". |
| 7 | Price strip        | Alul: `$39,990  •  Est. delivery Mar 2026`, `--text-muted`.            |
| 8 | Scroll cue         | Animalt chevron, 1.5s loop, `prefers-reduced-motion` eseten statikus. |

### 5.4 Hero interaction states

- **Hover (CTA primary)**: `transform: translateY(-1px)`, `box-shadow: 0 8px 24px rgba(255,255,255,0.08)`, transition 200ms ease.
- **Focus-visible**: `outline: 2px solid var(--accent-glow)`, `outline-offset: 4px`.
- **Sticky nav scrolled**: hatter `rgba(11,11,13,0.85)` + `backdrop-filter: blur(12px)`, border-bottom 1px hairline.

### 5.5 Hero accessibility checklist

- [ ] Hero kepnek van `alt=""` (decorative), a tartalom teljesen szovegben is olvashato.
- [ ] CTA-k sorrendje tab-navigacioval logikus (primary → secondary).
- [ ] Kontraszt arany headline / subhead: **≥ 12:1**.
- [ ] `prefers-reduced-motion: reduce` eseten nincs animacio, a scroll cue statikus.
- [ ] A price strip `aria-live="polite"`-tal jelzi az arvaltozast (P3 finomhangolas).

---

## 6. Spacing & Layout System

8px alapu grid:

```
--space-1: 0.25rem   /*  4px */
--space-2: 0.5rem    /*  8px */
--space-3: 1rem      /* 16px */
--space-4: 1.5rem    /* 24px */
--space-5: 2rem      /* 32px */
--space-6: 3rem      /* 48px */
--space-7: 4rem      /* 64px */
--space-8: 6rem      /* 96px */
--space-9: 8rem      /* 128px */
```

Container max-width: **1280px**, gutter: **24px (mobile) / 48px (desktop)**.

Section vertical rhythm: min **96px** desktop, **64px** mobile kozottuk.

---

## 7. Motion / Micro-interactions

| Interaction               | Duration | Easing                       | Megjegyzes                  |
| ------------------------- | -------- | ---------------------------- | --------------------------- |
| Hero scroll cue loop      | 1500ms   | `ease-in-out`                | csak `prefers-reduced-motion: no-preference` |
| CTA hover lift            | 200ms    | `cubic-bezier(0.2, 0.8, 0.2, 1)` |                           |
| Section reveal on scroll  | 600ms    | `cubic-bezier(0.2, 0.8, 0.2, 1)` | IntersectionObserver      |
| Nav blur on scroll        | 250ms    | `ease-out`                   |                             |
| Spec counter animation    | 1200ms   | `ease-out`                   | szamok "odaszamolodnak"     |

`prefers-reduced-motion: reduce` → minden duration → 0.01ms.

---

## 8. Component Inventory (P3-ra elokeszitve)

A P3 fazisban az alabbi komponenseket kell megvalositani:

1. `Nav` — sticky, blur, scroll-aware
2. `Hero` — full-bleed kep + headline + CTA cluster
3. `SpecGrid` — 3-up statisztika blokk (gyorsulas / hatotav / toltes)
4. `Section` — reusable wrapper (cim + tartalom + CTA)
5. `Button` — primary / secondary / ghost variansok
6. `PriceStrip` — ar + kiszallitasi informacio
7. `Footer` — linkek, nyelvvalaszto, copyright

Mindegyikhez tartozik **responsive** es **a11y** specifikacio a P3-as implementaciohoz.

---

## 9. Out of Scope (P2)

A kovetkezo elemek **nem reszei** ennek a redesign javaslatnak, kesobbi fazisokra tolva:

- Konkret kod (React / Vue / vanilla) — P3.
- CMS integracio (Drupal 9 → modern stack migration) — P4.
- A/B testing terv es analitika — P5.
- Lokalizacio es i18n pipeline — P5.
- AR/VR showroom integracio — kulon projekt.

---

## 10. Open Questions (P2 → P3 atmenethez)

1. **Stack dontes**: React (Next.js) vagy vanilla HTML/CSS/JS? — dependency: P3 implementacios terv.
2. **Kep forras**: digitalassets.tesla.com CDN vagy sajat optimalizalt pipeline?
3. **Brand font licenc**: Tesla Typography licencelheto, vagy maradjon az Inter fallback?
4. **Multilingual**: HU / EN / DE egyidejuleg, vagy HU-first?
5. **Performance budget**: LCP ≤ 2.0s, CLS ≤ 0.05, TBT ≤ 100ms — elfogadhato?

---

## Osszefoglalas

Ez a dokumentum a **vizualis nyelvet, design tokeneket es a hero section specifikaciojat** definialja. A P1 audit altal feltart hianyossagokra (vilagos/sekelyes tipografia, gyenge CTA hierarchia, alacsony kontraszt) a javasolt dark theme + fluid type scale + ketgombos CTA cluster kozvetlen valaszt ad.

**Kovetkezo fazis (P3)**: komponens-szintu kod, responsive layout implementacio, motion + a11y validacio.