# Tesla Model 3 – Design Koncepció (2025-ös Redizájn)

## 1. Háttér és inspiráció
- A jelenlegi `tesla.com/tesla-3` oldal ultraminimalista, teljes képernyős hero fotó, középre igazított fekete headline, alul CTA-gombok.
- A `tesla.com/modely` oldal ugyanezt a nyelvezetet viszi tovább, de 2024-től erősebb hero animációkkal, sötétebb tónusú "night-render" képekkel és nagyobb kontraszttal dolgozik.
- 2025-ös trendek (EV landing page-eken): sötét mód first-class, glassmorphism a CTA-knál, scroll-vezérelt mikro-animációk (parallax, scrub), aurora-glow effect-ek a fotók körül, monospaced data-label + groteszk display-headline keverék.

## 2. Színpaletta (WCAG AA kontraszttal)
| Token              | Hex       | Szerep                                    | Kontraszt vs. `bg` |
|--------------------|-----------|-------------------------------------------|--------------------|
| `--bg`             | `#0B0B0F` | Háttér (sötét mód alap)                   | 1:1 baseline       |
| `--bg-elevated`    | `#15151B` | Kártyák, glass-panelek                    | –                  |
| `--fg`             | `#F5F5F7` | Elsődleges szöveg (Body)                  | 17.4:1 (AAA)       |
| `--fg-muted`       | `#9A9AA2` | Másodlagos szöveg, label                  | 6.2:1 (AA)         |
| `--primary`        | `#E82127` | Elsődleges brand akcent (Tesla Red)       | 5.1:1 vs. `--bg` (AA Large) |
| `--primary-hover`  | `#FF3B3F` | CTA hover / glow                          | –                  |
| `--secondary`      | `#3E6AE0` | Másodlagos akcent (EV blue – charge)      | 5.9:1 vs. `--bg`   |
| `--accent`         | `#D4AF37` | Prémium kiemelés (Performance badge)      | 9.1:1 vs. `--bg`   |
| `--border`         | `#2A2A33` | Elválasztók, glass-stroke                 | –                  |
| `--success`        | `#22C55E` | VIN valid / elérhető státusz              | 6.8:1 (AA)         |
| `--warning`        | `#F59E0B` | Degradation notice                        | 8.4:1 (AAA)        |

Világos mód opcionálisan (`prefers-color-scheme: light`): `--bg #FFFFFF`, `--fg #0B0B0F`, kontraszt 19.1:1.

## 3. Tipográfia
- **Display**: `Inter Tight`, fallback `system-ui` – automotive "engineered" feeling, szűk letter-spacing.
- **Body**: `Inter`, 16px alap – olvashatóság first.
- **Mono / data**: `JetBrains Mono` – VIN-kódokhoz, specifikációkhoz, degradációs státuszokhoz.

| Szerep            | Méret (rem) | Súly  | Letter-spacing      |
|-------------------|-------------|-------|---------------------|
| Hero headline     | 4.5 (72px)  | 700   | -0.04em             |
| Section title     | 2.25 (36px) | 600   | -0.02em             |
| Subsection        | 1.5 (24px)  | 600   | -0.01em             |
| Body lg           | 1.125 (18px)| 400   | 0                   |
| Body              | 1.0 (16px)  | 400   | 0                   |
| Caption / mono    | 0.8125 (13px)| 500  | 0.04em (uppercase)  |

Fluid típuskorlátozás `clamp(min, fluid, max)` minden headline-on.

## 4. Layout
- **Container max-width**: `1440px`, padding `clamp(16px, 4vw, 48px)`.
- **Grid**: 12 oszlopos, gutter `24px`, `1fr` mobile / `repeat(12, 1fr)` desktop ≥1024px.
- **Breakpointok**:
  - `xs` < 480px (mobilon hamburger, single column)
  - `sm` 480-767 (egy oszlopos hero, érintésre optimalizált)
  - `md` 768-1023 (6 oszlop, side-by-side CTA)
  - `lg` 1024-1439 (12 oszlop, teljes layout)
  - `xl` ≥ 1440 (szélesvásznú élmény)
- **Hero section**: 100vh, háttér egy nagy felbontású Model 3 render, overlay gradient (`linear-gradient(180deg, rgba(11,11,15,0.6) 0%, transparent 40%)`). Középre igazított headline + dual CTA (Order Now / Test Drive).
- **Degradation section**: 3 oszlopos grid kártya (Battery, Motor, Software), mindegyik progress-bar-ral + százalékos értékkel (mono fontban).
- **VIN section**: full-width sticky form, bal oldalon 6 inputs (17 karakter, monospace), jobb oldalon live preview a VIN dekódoláshoz (modell, gyártási év, gyár kód).

## 5. Vizuális elemek
- **Gradient**: `radial-gradient(circle at 50% 0%, rgba(232,33,39,0.18), transparent 60%)` a hero tetején, Tesla "energy" érzet.
- **Glassmorphism**: minden primary CTA `backdrop-filter: blur(20px) saturate(180%)`, `background: rgba(232,33,39,0.85)`, 1px border `rgba(255,255,255,0.1)`.
- **Micro-animations**:
  - Scroll-triggered fade-in + 12px upward translate (`IntersectionObserver` + `transform`).
  - Hero CTA pulse: `box-shadow` 0 → 24px rgba(232,33,39,0.5), 2s ease infinite.
  - Vehicle render lassú 360° forgás görgetésre (`scroll-timeline` + `@keyframes`).
  - VIN inputok karakterenkénti betű-animáció.
- **Glow effects**: text-shadow 0 0 40px rgba(232,33,39,0.4) a Performance badge-en, kártyáknál `box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`.
- **Motion prefer**: minden animáció mögé `prefers-reduced-motion: reduce` fallback statikus állapotot rak.

## 6. Implementációs javaslat
- CSS custom properties az egész palettához (`:root[data-theme="dark"]`).
- Tailwind `theme.extend.colors`-ban bindolva a tokenekre, hogy utility-first maradjon.
- React/Vite + Framer Motion az animációkhoz, Next.js Image a hero render LCP optimalizáláshoz (`priority`, AVIF/WebP).
- Akadálymentesség: focus-visible outline 2px `--accent`, skip-to-content link, aria-labels a CTA-knál.

KESZ
