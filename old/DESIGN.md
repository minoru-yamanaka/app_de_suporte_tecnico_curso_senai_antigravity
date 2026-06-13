---
name: Technical Support System
colors:
  surface: '#fbf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fbf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f4'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e3'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45474c'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#1e1200'
  on-tertiary: '#ffffff'
  tertiary-container: '#35260c'
  on-tertiary-container: '#a38c6a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#fadfb8'
  tertiary-fixed-dim: '#ddc39d'
  on-tertiary-fixed: '#271902'
  on-tertiary-fixed-variant: '#564427'
  background: '#fbf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style
This design system is engineered for an Integrated Technical Support Web App, focusing on reliability, technical precision, and high-density information management. The brand personality is professional, utilitarian, and authoritative, designed to instill confidence in maintenance and support personnel.

The design style follows a **Corporate / Modern** approach with a slight lean towards **Minimalism** to ensure that data remains the primary focus. It prioritizes clarity and rapid scanning over decorative elements. The aesthetic is clean and structured, utilizing a systematic grid to handle complex ticket data and equipment statuses without overwhelming the user.

## Colors
The palette is rooted in a professional Deep Navy and Slate Gray foundation to maintain a "mission-control" feel. 

- **Primary & Secondary:** Used for structural elements like side navigation, headers, and secondary UI labels.
- **Background:** A very light gray is used to reduce eye strain during long shifts while providing enough contrast for white cards.
- **Domain Accents:** Specific colors are assigned to technical sectors (IT, Electrical, Civil, Security, Telecom) to allow for instant visual categorization of tickets in a list.
- **Priority Indicators:** High-saturation tones are reserved for urgency levels, ensuring "Critical" items are impossible to ignore.

## Typography
The system uses **Inter** for its exceptional legibility in data-heavy environments. **JetBrains Mono** is introduced as a secondary font for technical IDs (e.g., Ticket Serial Numbers or IP Addresses) to ensure character distinction (like 0 vs O).

- **Hierarchy:** Use `display-lg` sparingly for dashboard overviews. 
- **Efficiency:** `body-sm` is the workhorse for data table rows to maximize information density.
- **Labels:** `label-caps` is used for table headers and section over titles to provide clear boundaries between data sets.

## Layout & Spacing
The layout employs a **Fluid Grid** system designed for high information density. 

- **Desktop:** 12-column grid with a narrow sidebar (240px) to maximize the central data workspace.
- **Density:** Spacing is tight (4px/8px increments) to allow technical users to see as many ticket rows as possible without scrolling. 
- **Data Tables:** Use a "Compact" vertical rhythm—12px padding on top/bottom of rows.
- **Side Navigation:** Fixed position on the left, using `primary_color_hex` as the background to anchor the application.

## Elevation & Depth
Depth is signaled through **Tonal Layers** and subtle, low-contrast outlines rather than heavy shadows.

- **Level 0 (Background):** `#F8FAFC` for the canvas.
- **Level 1 (Cards/Surface):** White background with a 1px border of `#E2E8F0`. No shadow.
- **Level 2 (Dropdowns/Modals):** White background with a soft ambient shadow (0px 4px 12px rgba(0,0,0,0.05)) to suggest it is floating above the data.
- **Interactive:** Buttons use a subtle inner-glow on hover to feel tactile without disrupting the flat aesthetic.

## Shapes
The shape language is **Soft** (4px / 0.25rem). 

- **Standard Elements:** Inputs, buttons, and cards use the base 4px radius.
- **Status Badges:** Use a slightly higher radius (rounded-lg) to distinguish them from interactive buttons.
- **FAB:** The "New Ticket" FAB is the only exception, utilizing a full pill-shape (rounded-full) to highlight its unique action.

## Components
### Side Navigation
Deep Navy (`#1E293B`) background. Active states should use a left-hand accent border in `accent_info` and a subtle highlight on the menu item.

### Data Tables
- **Headers:** Use `label-caps` with a light gray background.
- **Rows:** Alternating subtle zebra striping. Actions (Edit, Close, Assign) appear as icon buttons in the final column.
- **Status Badges:** Semi-transparent background of the accent color with high-contrast text (e.g., Background: `rgba(59, 130, 246, 0.1)`, Text: `#3B82F6`).

### Dashboard Cards
White surfaces with a 1px border. Use "Metric + Label" layout. Include a small sparkline or percentage change indicator for ticket trends.

### Floating Action Button (FAB)
Positioned at the bottom right. Background: `#1E293B`, Icon: White. Label: "Novo Chamado". On scroll, the label should collapse into just the icon to save space.

### Input Fields
Strict, rectangular fields with 1px border. Focus state uses a 2px `accent_info` ring. Labels are placed above the field in `body-sm` bold.

### Priority Indicators
Small colored circles (status dots) placed next to the Ticket ID to provide instant visual scanning of urgency levels.