# STYLE_GUIDE.md
# Laundry Warehouse Storage System UI Style Guide

## Purpose

This style guide defines the visual design rules for the Laundry Warehouse / Blanket Storage Management System.

The interface should look like a dark futuristic warehouse control dashboard for desktop, tablet, and mobile workers.

The design must not look like a normal admin table.

---

## Design Direction

Use this visual language:

- Dark futuristic control panel
- Warehouse logistics dashboard
- Gaming-style operational UI
- Neon blue active states
- Magenta stored cells
- Green selected target cell
- Large readable numbers
- High contrast
- Rounded panels
- Soft glow effects
- Professional SaaS dashboard

---

## Main Layouts

### Desktop / Tablet Layout

The desktop/tablet interface should include:

1. Left vertical sidebar
2. Left search/result panel
3. Top search and 2D/3D toggle bar
4. Central warehouse grid
5. Bottom store selector bar

### Mobile Layout

Mobile can use a simplified stacked layout:

1. Top search bar
2. Store selector
3. Grid
4. Result/action panel
5. Keypad/input panel when needed

---

## Color Tokens

```css
:root {
  --bg-main: #06111F;
  --bg-deep: #071426;
  --bg-panel: #0D1B2E;
  --bg-card: #142238;
  --bg-card-soft: #182842;
  --bg-input: #152238;

  --border-soft: #203A5C;
  --border-strong: #263B5B;
  --border-bright: #2F7DFF;

  --blue: #216BFF;
  --blue-2: #2F7DFF;
  --blue-soft: #5EA0FF;
  --blue-glow: rgba(47, 125, 255, 0.55);

  --green: #10A978;
  --green-2: #0EA36F;
  --green-border: #3DFFD0;
  --green-glow: rgba(61, 255, 208, 0.65);

  --magenta-cell: #3A1028;
  --magenta-cell-2: #4A1430;
  --magenta-border: #B01F63;
  --magenta-text: #FF9BC7;
  --magenta-glow: rgba(176, 31, 99, 0.35);

  --orange: #F59E0B;
  --orange-bg: #3A2608;

  --red: #EF4444;
  --red-bg: #3A1111;

  --text-main: #FFFFFF;
  --text-soft: #9FB0C7;
  --text-muted: #64748B;

  --shadow-panel: 0 30px 80px rgba(0, 0, 0, 0.45);
}

Created a new Figma file for the desktop/tablet view:

[Open Figma view](https://www.figma.com/design/H7mtBwXbMAK65AzERSo5ub)

Here is the `STYLE_GUIDE.md` content:

````md
# STYLE_GUIDE.md
# Laundry Warehouse Storage System UI Style Guide

## Purpose

This style guide defines the visual design rules for the Laundry Warehouse / Blanket Storage Management System.

The interface should look like a dark futuristic warehouse control dashboard for desktop, tablet, and mobile workers.

The design must not look like a normal admin table.

---

## Design Direction

Use this visual language:

- Dark futuristic control panel
- Warehouse logistics dashboard
- Gaming-style operational UI
- Neon blue active states
- Magenta stored cells
- Green selected target cell
- Large readable numbers
- High contrast
- Rounded panels
- Soft glow effects
- Professional SaaS dashboard

---

## Main Layouts

### Desktop / Tablet Layout

The desktop/tablet interface should include:

1. Left vertical sidebar
2. Left search/result panel
3. Top search and 2D/3D toggle bar
4. Central warehouse grid
5. Bottom store selector bar

### Mobile Layout

Mobile can use a simplified stacked layout:

1. Top search bar
2. Store selector
3. Grid
4. Result/action panel
5. Keypad/input panel when needed

---

## Color Tokens

```css
:root {
  --bg-main: #06111F;
  --bg-deep: #071426;
  --bg-panel: #0D1B2E;
  --bg-card: #142238;
  --bg-card-soft: #182842;
  --bg-input: #152238;

  --border-soft: #203A5C;
  --border-strong: #263B5B;
  --border-bright: #2F7DFF;

  --blue: #216BFF;
  --blue-2: #2F7DFF;
  --blue-soft: #5EA0FF;
  --blue-glow: rgba(47, 125, 255, 0.55);

  --green: #10A978;
  --green-2: #0EA36F;
  --green-border: #3DFFD0;
  --green-glow: rgba(61, 255, 208, 0.65);

  --magenta-cell: #3A1028;
  --magenta-cell-2: #4A1430;
  --magenta-border: #B01F63;
  --magenta-text: #FF9BC7;
  --magenta-glow: rgba(176, 31, 99, 0.35);

  --orange: #F59E0B;
  --orange-bg: #3A2608;

  --red: #EF4444;
  --red-bg: #3A1111;

  --text-main: #FFFFFF;
  --text-soft: #9FB0C7;
  --text-muted: #64748B;

  --shadow-panel: 0 30px 80px rgba(0, 0, 0, 0.45);
}
````

---

## Typography

Use:

```css
font-family: Inter, system-ui, Arial, sans-serif;
```

### Text Rules

* Titles: bold, uppercase where useful
* Labels: uppercase, small, letter-spaced
* Buttons: uppercase, bold
* Cell numbers: extra bold
* Use tabular numbers for warehouse grid values

```css
font-variant-numeric: tabular-nums;
```

### Suggested Sizes

```css
--font-xs: 10px;
--font-sm: 12px;
--font-md: 14px;
--font-lg: 18px;
--font-xl: 24px;
--font-2xl: 32px;
```

---

## Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;
--radius-2xl: 34px;
--radius-pill: 999px;
```

Use rounded panels and pill buttons heavily.

---

## Shadows and Glow

### Blue Active Glow

```css
box-shadow: 0 0 20px rgba(47, 125, 255, 0.55);
```

### Green Target Glow

```css
box-shadow: 0 0 18px rgba(61, 255, 208, 0.65);
```

### Magenta Stored Cell Glow

```css
box-shadow: 0 0 12px rgba(176, 31, 99, 0.35);
```

### Main Panel Shadow

```css
box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
```

---

## Desktop / Tablet Layout Rules

### App Shell

```css
.desktop-warehouse-shell {
  min-height: 100vh;
  width: 100vw;
  background: var(--bg-main);
  color: var(--text-main);
  display: grid;
  grid-template-columns: 96px 360px 1fr;
  grid-template-rows: 120px 1fr 84px;
  overflow: hidden;
}
```

Suggested grid areas:

```css
.desktop-warehouse-shell {
  grid-template-areas:
    "sidebar searchPanel topbar"
    "sidebar searchPanel grid"
    "sidebar searchPanel storebar";
}
```

---

## Left Sidebar

### Purpose

Primary navigation and active tool state.

### Style

```css
.left-sidebar {
  grid-area: sidebar;
  background: #0B1424;
  border-right: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

### Rules

* Width: 86px to 110px
* Icons stacked vertically
* Active icon is blue with glow
* Avatar/profile button at bottom
* Sidebar fixed on desktop/tablet

### Active Icon

```css
.sidebar-icon.active {
  background: var(--blue);
  color: white;
  box-shadow: 0 0 20px var(--blue-glow);
}
```

---

## Search Result Panel

### Purpose

Shows selected search result and all matches.

### Style

```css
.search-result-panel {
  grid-area: searchPanel;
  background: var(--bg-panel);
  border-right: 1px solid var(--border-strong);
  padding: 18px;
  overflow-y: auto;
}
```

### Required Elements

* Header: `SEARCH`
* Hide button
* Result card
* Pick count
* Blanket/order number
* Store
* Position
* Last status
* Mark as picked button
* Zoom to slot button
* Previous/next buttons
* All matches list

### Result Card

```css
.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border-strong);
  border-radius: 22px;
  padding: 22px;
}
```

---

## Top Search Bar

### Purpose

Main retrieve/search control and 2D/3D toggle.

### Style

```css
.top-search-bar {
  grid-area: topbar;
  background: #0B172A;
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 28px;
}
```

### Search Input

```css
.retrieve-search {
  flex: 1;
  height: 76px;
  background: var(--bg-input);
  border: 2px solid #24466F;
  border-radius: 34px;
  color: var(--text-main);
  font-size: clamp(18px, 1.4vw, 28px);
  font-weight: 800;
  padding: 0 26px;
}
```

### Placeholder

Use:

```text
Enter Blanket Number to Retrieve...
```

---

## 2D / 3D View Toggle

### Container

```css
.view-toggle {
  display: flex;
  background: #0D1B2E;
  border: 1px solid var(--border-strong);
  border-radius: 24px;
  padding: 8px;
}
```

### Active Button

```css
.view-toggle-button.active {
  background: var(--blue);
  color: white;
  box-shadow: 0 0 20px var(--blue-glow);
}
```

### Labels

Use:

```text
2D View
3D View
```

---

## Warehouse Grid Panel

### Purpose

Visual map of the active store.

### Container

```css
.warehouse-grid-panel {
  grid-area: grid;
  background: var(--bg-deep);
  padding: 24px 28px;
  overflow: auto;
}
```

### Inner Panel

```css
.grid-frame {
  min-width: max-content;
  background: #08172A;
  border: 2px solid var(--border-soft);
  border-radius: 34px;
  padding: 24px;
  box-shadow: inset 0 0 30px rgba(47, 125, 255, 0.08);
}
```

---

## Warehouse Cells

### General Cell

```css
.warehouse-cell {
  min-width: 72px;
  min-height: 48px;
  border-radius: 10px;
  border: 2px solid var(--border-soft);
  background: #071426;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  text-align: center;
  font-size: clamp(14px, 1.2vw, 22px);
  font-weight: 900;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
```

### Empty Cell

```css
.warehouse-cell.empty {
  background: #071426;
  border-color: #203A5C;
}
```

### Stored Cell

```css
.warehouse-cell.stored {
  background: var(--magenta-cell);
  border-color: var(--magenta-border);
  color: var(--magenta-text);
  box-shadow: 0 0 12px var(--magenta-glow);
}
```

### Selected / Target Cell

```css
.warehouse-cell.selected,
.warehouse-cell.highlighted {
  background: var(--green);
  border-color: var(--green-border);
  color: white;
  box-shadow: 0 0 18px var(--green-glow);
}
```

### Duplicate Cell

```css
.warehouse-cell.duplicate {
  background: var(--orange-bg);
  border-color: var(--orange);
  color: #FDE68A;
}
```

### Invalid / Conflict Cell

```css
.warehouse-cell.invalid,
.warehouse-cell.conflict {
  background: var(--red-bg);
  border-color: var(--red);
  color: #FECACA;
}
```

---

## Responsive Cell Sizing

Use dynamic sizes. Do not cut numbers.

```css
:root {
  --cell-min: 64px;
  --cell-ideal: 6vw;
  --cell-max: 116px;

  --cell-height-min: 44px;
  --cell-height-ideal: 4.5vw;
  --cell-height-max: 72px;
}
```

```css
.warehouse-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(
    var(--cols),
    minmax(var(--cell-min), clamp(var(--cell-min), var(--cell-ideal), var(--cell-max)))
  );
}
```

```css
.warehouse-cell {
  min-height: clamp(var(--cell-height-min), var(--cell-height-ideal), var(--cell-height-max));
}
```

### Important Rule

If the screen is too small, allow horizontal scrolling.

Do not shrink cell text until unreadable.

---

## Long Cell Values

For values like:

```text
4.270brown
```

Use:

```css
.warehouse-cell.compact-text {
  font-size: clamp(11px, 0.95vw, 16px);
}

.warehouse-cell.very-long-text {
  font-size: clamp(10px, 0.85vw, 14px);
  letter-spacing: -0.2px;
}
```

Always add:

```html
title="full cell value"
```

---

## Cell Tooltip

### Purpose

Show more information on hover.

### Style

```css
.cell-tooltip {
  background: rgba(29, 47, 75, 0.96);
  border: 1px solid var(--blue-2);
  color: var(--text-main);
  border-radius: 10px;
  padding: 8px 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}
```

### Content

* Number
* Store
* Position
* Latest action/status

---

## Bottom Store Bar

### Container

```css
.bottom-store-bar {
  grid-area: storebar;
  background: var(--bg-panel);
  border-top: 1px solid var(--border-strong);
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  padding: 12px 22px;
}
```

### Store Tab

```css
.store-tab {
  height: 52px;
  padding: 0 20px;
  border-radius: 18px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-soft);
  font-weight: 900;
  white-space: nowrap;
}
```

### Active Store Tab

```css
.store-tab.active {
  background: var(--blue-2);
  color: white;
  box-shadow: 0 0 20px var(--blue-glow);
}
```

### Store Tabs List

Required stores:

```text
A1, B, B1-back, B1-front, B2-back, B2-front, B3-back, B3-front, B4, B4-front, C, conveyer
```

---

## Store Management Modal

### Rule

Store actions must open as a popup modal.

Do not use dropdown.

### Trigger

* Three-dot button on active store
* Right click on store tab
* Long press on tablet/mobile

### Modal Container

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
```

```css
.store-modal {
  width: min(760px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow: auto;
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 24px;
  color: white;
  box-shadow: var(--shadow-panel);
}
```

### Modal Actions

* Store Summary
* Import Numbers from Excel
* Export Store to Excel
* Move All to Another Store
* Lock / Unlock Store
* Store Health Check
* View Store History
* Print QR / Location Labels
* Clear Empty Cells Only
* Empty Store

Danger actions must be separated and red/pink.

---

## Buttons

### Primary Blue

```css
.btn-primary-blue {
  background: var(--blue-2);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 900;
  box-shadow: 0 0 20px var(--blue-glow);
}
```

### Primary Green

```css
.btn-primary-green {
  background: var(--green);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 900;
  box-shadow: 0 0 18px rgba(16, 169, 120, 0.45);
}
```

### Secondary Dark

```css
.btn-secondary-dark {
  background: #1A2740;
  color: white;
  border: 1px solid var(--border-strong);
  border-radius: 16px;
  font-weight: 900;
}
```

### Danger

```css
.btn-danger {
  background: #341629;
  color: #FDA4AF;
  border: 1px solid #7F1D4E;
  border-radius: 16px;
  font-weight: 900;
}
```

---

## Excel Matrix Import Preview

### Style

The import preview should look like a dark Excel matrix.

### Requirements

* Column letters A, B, C...
* Row numbers 1, 2, 3...
* Sticky header
* Sticky first column
* Scroll horizontally and vertically
* Keep original matrix shape
* Highlight valid, duplicate, invalid, conflict cells

### Colors

* Header cells: `#0D1B2E`
* Normal cells: `#0B172A`
* Valid: subtle green
* Duplicate: orange
* Invalid/conflict: red
* Expanded target area: blue outline

---

## Import / Empty Performance UI

### Import Progress Steps

Show:

* Parsing file
* Detecting layout
* Expanding stores
* Validating cells
* Importing records
* Updating grid
* Finished

### Empty Store

After confirmation:

* Show fast loading state
* Clear via bulk operation
* Update local state immediately
* Show success toast with time taken

Example:

```text
B1-front emptied successfully in 1.2s
```

---

## Responsive Rules

### Desktop >= 1200px

* Full layout visible
* Sidebar visible
* Search panel visible
* Large grid
* Bottom tabs visible

### Tablet 768px to 1199px

* Sidebar narrower
* Search panel can collapse
* Grid remains primary
* Bottom tabs remain visible

### Mobile < 768px

* Use simplified mobile layout
* Do not force desktop layout
* Store tabs horizontally scroll
* Grid may scroll horizontally
* Keep text readable

---

## Accessibility

* Buttons must have accessible labels
* Cells should include full value in `title`
* Cells should include `aria-label`
* Modal should close with ESC
* Dangerous confirmation should not close by clicking overlay
* Keep strong contrast

---

## Final Design Rules

Always prioritize:

1. Readability
2. Speed
3. Clear visual guidance
4. Low worker confusion
5. Safe admin operations

Never:

* Make the grid look like a normal admin table
* Hide or cut stored numbers
* Shrink text until unreadable
* Use dropdown for store actions
* Process import/empty cell by cell
* Rebuild the project unnecessarily

````

Use this line with future AI edits:

```text
Read STYLE_GUIDE.md and GEMINI.md first. Follow them strictly. Only modify the files needed for this task.
````
