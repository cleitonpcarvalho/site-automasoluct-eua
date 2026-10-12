---
name: Automa Soluct Engineering
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c3c5d8'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#8d90a1'
  outline-variant: '#434655'
  surface-tint: '#b6c4ff'
  primary: '#b6c4ff'
  on-primary: '#002780'
  primary-container: '#0a4ee4'
  on-primary-container: '#ced6ff'
  inverse-primary: '#0c4fe5'
  secondary: '#c7c6cb'
  on-secondary: '#2f3035'
  secondary-container: '#46464b'
  on-secondary-container: '#b5b4ba'
  tertiary: '#c5c6cf'
  on-tertiary: '#2e3038'
  tertiary-container: '#5c5d65'
  on-tertiary-container: '#d6d6e0'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#003ab3'
  secondary-fixed: '#e3e2e7'
  secondary-fixed-dim: '#c7c6cb'
  on-secondary-fixed: '#1a1b20'
  on-secondary-fixed-variant: '#46464b'
  tertiary-fixed: '#e2e2ec'
  tertiary-fixed-dim: '#c5c6cf'
  on-tertiary-fixed: '#191b22'
  on-tertiary-fixed-variant: '#45464e'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies high-precision B2B software engineering. It is technical, direct, and uncompromisingly utilitarian, built to command authority among engineering leaders, enterprise architects, and technical decision-makers. The visual tone mirrors mission-critical developer tooling: silent efficiency, zero visual clutter, and instant clarity.

The aesthetic fuses technical minimalism with a modern, high-contrast dark architecture:
- True black canvas (`#000000`) establishes an uncompromisingly dark foundation.
- Monochromatic neutral surfaces (`#0B0B0D` and `#111216`) provide discreet architectural separation without introducing atmospheric haze or unwanted chromatic tinting.
- Precision electric blue accents provide laser-focused intentionality across interactions, state transitions, and key conversion paths.
- Avoid all decorative gradients, neon bloom, fuzzy glows, glass reflections, and decorative skeuomorphism. Depth is communicated strictly through tonal contrast, structured line work, and microscopic border delineation.

## Colors

The palette is engineered for maximum legibility in low-light environments, avoiding color fatigue and extraneous illumination:

- **Canvas & Backgrounds:** The base viewport sits on true black `#000000`. Card and component layers step up to Layer 1 `#0B0B0D` and Layer 2 `#111216`, with interactive hovers stepping up to `#181A20`. There are strictly no lavender, cyan, or blue-white surfaces.
- **Accents:** `#0A4EE4` serves as the primary actionable anchor. Active borders, focused rings, and critical UI state highlights leverage this cobalt blue. For text links or muted interactive states, use `#3D78F5` to preserve strict WCAG AAA compliance against dark surfaces.
- **Content & Typography:** High-contrast, stark text hierarchy:
  - High-emphasis (Headlines, primary metrics, active inputs): `#FFFFFF`
  - Medium-emphasis (Body, labels, standard content): `#C5C7CE`
  - Low-emphasis (Metadata, disabled, secondary captions): `#71747E`
- **Borders & Dividers:** Precision borders use `#1B1D24` for default structural dividers, stepping up to `#2A2D38` on hovered cards, and `#0A4EE4` on active/focused states.

## Typography

The typographic hierarchy prioritizes rapid scannability and dense technical communication.

- **Headlines (Plus Jakarta Sans):** Geometric, solid, and modern without being decorative. Tighter negative letter-spacing (`-0.01em` to `-0.03em`) lends an engineered, editorial solidity to section titles and metric showcases.
- **Body & Controls (Inter):** Highly legible, neutral workhorse engineered for complex data layouts, tables, and settings consoles.
- **Code & Telemetry (JetBrains Mono):** Leveraged for API tokens, git commits, endpoints, terminal outputs, and machine identifiers to immediately cue raw technical data.

## Layout & Spacing

The layout is structured on an uncompromising 12-column responsive fluid grid with strict mathematical proportions based on an 8px grid foundation (augmented by a 4px sub-grid for dense UI controls):

- **Desktop (>= 1280px):** 12-column grid, max-width 1360px container, 24px (`1.5rem`) gutters, and 48px (`3rem`) screen margins.
- **Tablet (768px - 1279px):** 8-column grid, 20px gutters, and 32px screen margins. Reflow two-column technical data cards into single-column or 2x2 modular blocks.
- **Mobile (< 768px):** 4-column grid, 16px (`1rem`) gutters, and 16px (`1rem`) screen margins. Multi-column data layouts, dashboards, and metrics collapse strictly into a linear vertical sequence.

Spacing tokens dictate spacing strictly: `space-xs` (4px) for inline badge/icon alignment, `space-sm` (8px) for input and button inner gaps, `space-md` (16px) for interior card padding and component separation, `space-lg` (24px) for section clusters, and `space-xl` (40px) for layout rhythm breaks.

## Elevation & Depth

This design system avoids physical drop shadows, diffused lighting, and radial glow textures. Elevation is communicated entirely through tonal surface layering and razor-thin borders:

- **Base Layer (Elevation 0):** `#000000` (Main workspace, canvas, viewport backdrops).
- **Surface Layer 1 (Elevation 1):** `#0B0B0D` with a 1px solid border `#1B1D24` (Data tables, main content cards, persistent sidebar navigation).
- **Surface Layer 2 (Elevation 2):** `#111216` with a 1px solid border `#242733` (Dropdown panels, flyouts, code snippets, nested modules).
- **Surface Layer 3 (Elevation 3):** `#16181F` with a 1px solid border `#2F3342` (Modal dialogs, popovers, system alerts).

When layered interaction occurs, overlays use a solid 60% opacity pure black backdrop (`rgba(0, 0, 0, 0.75)`) without blur to maintain crisp, high-performance rendering.

## Shapes

The shape system adopts a concise, industrial corner profile (`roundedness: 1`):

- **Default UI (`0.25rem` / 4px):** Standard buttons, text inputs, chips, badge tags, inline code blocks, and toggle switches.
- **Containers & Panels (`rounded-lg` / `0.5rem` / 8px):** Primary cards, dialog modals, code execution blocks, table wrappers, and flyout menus.
- **Structural Wrappers (`rounded-xl` / `0.75rem` / 12px):** Top-level application modules and standalone marketing callouts.

Circles (`rounded-full`) are reserved solely for user avatars and circular status telemetry dots (e.g., active pipeline state). All other elements maintain precise, razor-sharp architectural geometry.

## Components

### Buttons
- **Primary:** Solid `#0A4EE4` background, `#FFFFFF` text, `4px` corner radius. Hover shifts to `#0C59FF`. Active/pressed state uses `#083EBA`. Focus ring is a 2px offset border in `#3D78F5`.
- **Secondary:** Surface `#111216`, 1px border in `#2A2D38`, `#FFFFFF` text. Hover uses surface `#181A20` with border `#3D78F5`.
- **Ghost/Tertiary:** Transparent background, `#C5C7CE` text. Hover uses `#111216` background and `#FFFFFF` text.

### Input Fields & Controls
- **Text Inputs:** Height 40px, background `#08080A`, border 1px solid `#1B1D24`, text `#FFFFFF`, placeholder `#71747E`, corner radius 4px. Focus state triggers border `#0A4EE4` with no fuzzy outer box-shadow.
- **Checkboxes & Radios:** 16px square/circle, background `#0B0B0D`, border 1px solid `#2A2D38`. Checked state fills `#0A4EE4` with `#FFFFFF` crisp vector checkmark.

### Chips & Badges
- **Status Badges:** Compact height (22px), background `#111216`, border 1px solid `#1B1D24`, text `#C5C7CE`, font size 12px `JetBrains Mono`.
- **Live State Indicator:** 6px solid dot indicator (`#0A4EE4` for active, `#22C55E` for operational, `#EF4444` for failed, `#71747E` for idle) aligned 6px to the left of the label.

### Cards & Data Panels
- **Default Card:** Background `#0B0B0D`, border 1px solid `#1B1D24`, internal padding `1.5rem` (`24px`).
- **Interactive Card:** When hoverable, transition border to `#2A2D38` and surface to `#111216` over 120ms with linear timing.

### Code & Terminal Blocks
- Background `#050506`, 1px border `#1B1D24`, padding `1rem`, font family `JetBrains Mono`, 12px size, line height 20px. Monochromatic syntax styling anchored by high-contrast whites and accent blue highlights.