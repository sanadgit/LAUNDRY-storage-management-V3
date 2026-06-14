# GEMINI.md
# AI Development Instructions for Laundry Warehouse Storage System

## Project Identity

This project is a Laundry Warehouse / Blanket Storage Management System for In & Out Laundry.

The system manages blanket/order storage locations inside multiple stores/sections such as:

- A1
- B
- B1-back
- B1-front
- B2-back
- B2-front
- B3-back
- B3-front
- B4
- B4-front
- C
- conveyer

The main goal is to reduce human errors in storing, searching, picking, moving, importing, and exporting blanket/order numbers.

---

## Very Important Rules

Do not rebuild the whole project.

Do not replace the existing architecture.

Do not remove existing API calls.

Do not remove existing database logic.

Do not remove existing search logic.

Do not remove existing grid logic.

Do not remove existing store logic.

Do not remove existing 2D/3D view logic.

Always make small, controlled updates.

Before changing any file, understand the existing structure first.

Prefer editing existing components instead of creating duplicate systems.

Do not create a second unrelated warehouse app inside the project.

---

## Tech Stack

The project is React + Vite.

Use React components.

Use CSS modules or normal CSS depending on the existing project style.

Keep compatibility with browser desktop, tablet, and mobile.

Backend may be Node.js / Express / SQLite / Supabase depending on the current project files. Do not assume. Inspect the project before editing.

---

## UI Style

The UI must look like a dark futuristic warehouse control dashboard.

Use this style:

- Dark navy background
- Gaming dashboard feel
- Logistics control room style
- Neon blue active elements
- Deep magenta stored cells
- Green selected target cell
- Rounded panels
- Soft glow
- High contrast
- Large readable grid
- Professional SaaS dashboard, not normal admin table

Color tokens:

```css
:root {
  --bg-main: #06111F;
  --bg-deep: #071426;
  --bg-panel: #0D1B2E;
  --bg-card: #142238;
  --bg-input: #152238;

  --border-soft: #203A5C;
  --border-strong: #263B5B;

  --blue: #216BFF;
  --blue-2: #2F7DFF;
  --blue-glow: rgba(47, 125, 255, 0.55);

  --green: #10A978;
  --green-border: #3DFFD0;

  --magenta-cell: #3A1028;
  --magenta-border: #B01F63;
  --magenta-text: #FF9BC7;

  --text-main: #FFFFFF;
  --text-soft: #9FB0C7;
  --text-muted: #64748B;
}