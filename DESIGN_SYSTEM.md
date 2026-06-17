---
name: Cognitive Commerce
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#474651'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#777682'
  outline-variant: '#c8c5d3'
  surface-tint: '#5654a8'
  primary: '#1a146b'
  on-primary: '#ffffff'
  primary-container: '#312e81'
  on-primary-container: '#9c9af4'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#212526'
  on-tertiary: '#ffffff'
  tertiary-container: '#373a3c'
  on-tertiary-container: '#a1a4a6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100563'
  on-primary-fixed-variant: '#3e3c8f'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-xs: 4px
  stack-md: 16px
  stack-xl: 40px
---

## Brand & Style

The design system is anchored in a philosophy of **Intelligent Precision**. It targets savvy consumers who value efficiency and data-driven decision-making. The visual language blends **Modern Corporate** reliability with **Glassmorphism** accents to signify the "transparent" nature of the underlying AI logic.

The emotional response should be one of quiet confidence—users should feel that the system is doing the heavy lifting of research and price analysis in the background. The aesthetic is clean and tech-forward, utilizing ample whitespace and refined, high-contrast typography to ensure that complex data remains digestible.

## Colors

The palette is dominated by **Deep Indigo** (`primary`) to establish authority and trust, while **Vibrant Violet** (`secondary`) is used sparingly for AI-driven features and interactive states. 

- **Price Logic**: Use `semantic_success` for discounts and "lowest price" indicators. Use `semantic_error` for price hikes or "out of stock" alerts.
- **Surface Strategy**: The background uses `tertiary` (Soft Slate) to reduce eye strain, while AI response bubbles utilize a dedicated `ai_surface` tint to distinguish machine-generated content from product listings.

## Typography

The design system exclusively utilizes **Inter** to ensure maximum legibility across dense data tables and chat interfaces. 

- **Hierarchy**: Use `display-lg` for primary hero sections. 
- **Data Display**: Product prices should always use the `price-lg` token with a tabular-nums configuration to ensure vertical alignment in comparison lists.
- **AI Feedback**: AI-generated responses utilize `body-md` with a slightly increased line-height (1.6) to improve reading speed for long-form summaries.

## Layout & Spacing

This design system uses a **Fluid Grid** with a 12-column structure for desktop and a 4-column structure for mobile. 

- **Chat Interface**: The central AI assistant view is constrained to a max-width of 800px to maintain optimal line lengths.
- **Product Grids**: Product comparison cards should follow a standard 4-column repeat on desktop, collapsing to 1-column on mobile.
- **Rhythm**: All vertical spacing between elements must be a multiple of 4px.

## Elevation & Depth

The system uses **Tonal Layers** combined with **Ambient Shadows** to create a sense of organized hierarchy.

1.  **Level 0 (Base)**: `tertiary` slate background.
2.  **Level 1 (Cards)**: White background with a soft 4px blur, 5% opacity indigo shadow. Used for product listings.
3.  **Level 2 (AI Bubbles)**: Elevated with a subtle `secondary` (Violet) glow to indicate active processing.
4.  **Level 3 (Overlays/Modals)**: High-contrast white surfaces with 16px blur shadows and a 1px `neutral` border at 10% opacity.

The interface should avoid heavy skeuomorphism, relying instead on 1px stroke borders to define boundaries between data segments.

## Shapes

The design system adopts a **Rounded** (8px) aesthetic. This strikes a balance between the technical rigidity of AI data and the approachability of a shopping assistant.

- **Buttons & Inputs**: 8px (`rounded-md`).
- **Product Cards**: 16px (`rounded-lg`) to create a softer container for product photography.
- **AI Chat Bubbles**: 16px corner radius, except for the leading corner (the side closest to the avatar) which remains at 4px to create a \"speech\" tail effect.

## Components

### Buttons
- **Primary**: Solid `primary_color`, white text, 8px radius.
- **AI Action**: Gradient background (`primary` to `secondary`), used for \"Generate Comparison\" or \"Ask AI.\"

### AI Response Bubbles
Bubbles must feature a 1px border of `secondary_color` at 20% opacity. They should include a \"Sources\" footer at the bottom, listing the stores crawled (RAG sources) in `label-caps` typography.

### Price Comparison Charts
Charts should be minimal, using `semantic_success` for the area fill of price drops. Vertical axes should be hidden; only the current price and the 30-day low should be explicitly labeled.

### Input Fields
Search inputs should be oversized (height: 56px) with a soft shadow and a `secondary` focus ring. The placeholder text should cycle through AI-prompt suggestions like \"Find the best noise-canceling headphones under $200.\"

### Product Cards
Cards feature a top-aligned image, followed by a price row, then an \"AI Sentiment\" chip. The sentiment chip summarizes reviews (e.g., \"Highly Rated for Durability\") using a `primary` tint background.