# 🎓 Campus Life Planner

> A responsive, accessible, vanilla HTML/CSS/JS single-page application for planning and managing campus events — built with zero frameworks and full keyboard support.

---

## 📌 Table of Contents

1. [Overview](#overview)
2. [Live Demo & Repository](#live-demo--repository)
3. [Chosen Theme](#chosen-theme)
4. [File Structure](#file-structure)
5. [Features List](#features-list)
6. [Data Model](#data-model)
7. [Regex Catalog](#regex-catalog)
8. [Keyboard Map](#keyboard-map)
9. [Accessibility Notes](#accessibility-notes)
10. [Setup & How to Run](#setup--how-to-run)
11. [How to Use the Application](#how-to-use-the-application)
12. [Import / Export](#import--export)
13. [Settings](#settings)
14. [Design Decisions](#design-decisions)
15. [How to Run Tests](#how-to-run-tests)
16. [seed.json](#seedjson)

---

## Overview

**Campus Life Planner** is a fully client-side web application that helps students organize, track, and search their campus events. It runs entirely in the browser with no backend, no frameworks, and no build tools — just plain HTML, CSS, and ES-module JavaScript.

All data is persisted to the browser's `localStorage` so events survive page refreshes and browser restarts. Events can also be bulk-imported or exported as structured JSON files.

---

## Live Demo & Repository

| | Link |
|---|---|
| 🌐 **GitHub Pages (Live)** | https://ApongsehIyan23.github.io/Summative-Assesment-CLP |
| 📁 **Repository** | https://github.com/ApongsehIyan23/Summative-Assesment-CLP |
| **Demo Video** | https://youtu.be/7eFjRjzLBWk

---

## Chosen Theme

**Theme 2 — Campus Life Planner**

Each record represents a campus event and stores:

- `title` — event name
- `date` — scheduled date (YYYY-MM-DD)
- `duration` — event duration in hours (or minutes, depending on the unit setting)
- `tag` — category label (e.g. `lecture`, `sports-club`, `workshop`)
- `description` — a short description of the event

---

## File Structure

```
📦 Summative-Assesment-CLP/
├── index.html              # Main HTML shell — all sections live here
├── alu-image.jpg           # Hero banner image
├── styles/
│   └── main.css            # All styles (mobile-first, 3 breakpoints)
├── scripts/
│   ├── main.js             # Entry point — event listeners, form logic, search
│   ├── ui.js               # Section switching, focus management
│   ├── storage.js          # localStorage CRUD + ID/color generation
│   ├── validators.js       # Regex validation rules + field state helpers
│   └── eventManipulation.js# Card rendering, sorting, stats, charts, import/export
├── seed.json               # ≥10 sample records for demo / import testing
└── tests.html              # In-browser unit tests for all validators
```

> All JavaScript files use **ES modules** (`type="module"`) — no bundler or transpiler needed.

---

## Features List

### Pages / Sections
- **Dashboard** — live stat cards (total events, total hours, top tag, average duration), hero banner, search bar with case-sensitive toggle, sort control, and the full event card grid
- **Create Event** — validated form for adding new events; doubles as the **Edit Event** form when editing an existing card
- **Statistics** — aggregate metrics (total events, total hours, weekly cap progress), a CSS bar chart showing tag frequency, a duration unit converter (hours ↔ minutes), and the 7-day upcoming events chart
- **Settings** — configure the preferred duration unit (hours / minutes) and set a weekly event cap; also exposes the "Clear All Events" danger action and the Import / Export controls
- **About** — app description, key feature highlights, and contact links (GitHub + email)

### Core Features
- ✅ Add, edit, and delete individual events
- ✅ Delete all events with a single confirmed action
- ✅ Sort events by date (newest/oldest), title (A→Z / Z→A), or duration (high/low)
- ✅ Live text search with toggle for case sensitivity and `<mark>` highlighting across title, tag, description, date, and duration fields
- ✅ Stats dashboard with total records, sum/average of duration, and top tag
- ✅ Weekly event cap with an ARIA assertive live region that fires when the cap is exceeded
- ✅ Duration unit converter (hours ↔ minutes) on the Statistics page
- ✅ Preferred duration unit setting (saved to `localStorage`)
- ✅ JSON export — downloads a timestamped `.json` file
- ✅ JSON import — validates structure and each field before accepting records
- ✅ Fully keyboard-navigable — all interactive elements are reachable by Tab/Enter/Space
- ✅ Responsive layout across mobile (≈360 px), tablet (≈768 px), and desktop (≈1024 px+)
- ✅ Bottom navigation bar for mobile users
- ✅ Skip-to-content link for screen reader and keyboard users
- ✅ ARIA live regions for status messages and alerts
- ✅ Smooth card entrance animations and hover transitions
- ✅ Accessible colour contrast throughout

---

## Data Model

Each event stored in `localStorage` follows this shape:

```json
{
  "id":          "evt_1717000000000_abc123xyz",
  "title":       "Introduction to Machine Learning",
  "date":        "2025-10-14",
  "duration":    "2.5",
  "tag":         "lecture",
  "description": "Guest lecture by Prof. Kariuki on neural networks.",
  "color":       "#1F6F8B",
  "createdAt":   "2025-10-01T09:30:00.000Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | Auto-generated: `"evt_" + Date.now() + "_" + random` — guaranteed unique |
| `title` | string | Required; validated |
| `date` | string | YYYY-MM-DD; validated |
| `duration` | string | Numeric 0–100, up to 2 decimal places; validated |
| `tag` | string | Letters, spaces, hyphens; normalized to lowercase on save |
| `description` | string | Optional; validated for duplicate words and unsafe characters |
| `color` | string | Randomly picked from a 6-colour palette at creation time |
| `createdAt` | string | ISO 8601 timestamp set at creation; never updated on edit |

> **Note:** `updatedAt` is not stored separately — the original `createdAt` timestamp is preserved on the card face to show when the event was first logged. Edits overwrite only the data fields.

---

## Regex Catalog

All regex validation lives in `scripts/validators.js`. Every validator also runs a safety pre-check (`isSafe`) before applying its domain-specific pattern.

---

### 1. Safety Guard — `isSafe(input)`

```regex
/^(?!.*[<>"`]).*$/s
```

**Purpose:** Blocks HTML-injection characters (`<`, `>`, `"`, `` ` ``) from every field before any other validation runs.

**Type:** Lookahead (advanced pattern)

| Input | Result |
|---|---|
| `Hello World` | ✅ Pass |
| `<script>` | ❌ Fail |
| `` `rm -rf /` `` | ❌ Fail |

---

### 2. Title — `validateTitle(title)`

```regex
/^\S(?:.*\S)?$/
```

**Purpose:** Forbids leading or trailing whitespace. A single non-whitespace character is the minimum valid title.

| Input | Result |
|---|---|
| `Study Group Meeting` | ✅ Pass |
| `  leading space` | ❌ Fail |
| `trailing space ` | ❌ Fail |
| `A` | ✅ Pass |

---

### 3. Date — `validateDate(date)`

```regex
/^(202[0-9]|203[0-9]|2040)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
```

**Purpose:** Enforces strict YYYY-MM-DD format. Year is constrained to 2020–2040 (realistic campus planning range), month to 01–12, day to 01–31.

| Input | Result |
|---|---|
| `2025-10-14` | ✅ Pass |
| `2025-13-01` | ❌ Fail (month 13) |
| `1999-01-01` | ❌ Fail (out of year range) |
| `2025/10/14` | ❌ Fail (wrong separator) |

---

### 4. Duration — `validateDuration(duration)`

```regex
/^(?:100|[1-9]?[0-9])(\.\d{1,2})?$/
```

**Purpose:** Accepts integers and decimals from 0 to 100, with up to 2 decimal places. Disallows negative values, leading zeros, and more than 2 decimal digits.

| Input | Result |
|---|---|
| `2.5` | ✅ Pass |
| `0` | ✅ Pass |
| `100` | ✅ Pass |
| `100.1` | ❌ Fail (exceeds 100) |
| `2.555` | ❌ Fail (3 decimal places) |
| `-1` | ❌ Fail |

---

### 5. Tag — `validateTag(tag)`

```regex
/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
```

**Purpose:** Allows only letters, with single spaces or hyphens as word separators. Numbers, symbols, or multiple consecutive separators are rejected.

| Input | Result |
|---|---|
| `lecture` | ✅ Pass |
| `sports-club` | ✅ Pass |
| `study group` | ✅ Pass |
| `tag123` | ❌ Fail |
| `sports--club` | ❌ Fail |

---

### 6. Description — `validateDescription(description)` ⭐ Advanced Pattern

```regex
/\b(\w+)\s+\1\b/i
```

**Purpose:** Uses a **back-reference** (`\1`) to detect accidental duplicate consecutive words (e.g. `"the the"`, `"and AND"`). The flag `i` makes the match case-insensitive so `"The the"` is also caught. The validator returns `false` (invalid) if a duplicate is found.

**Type:** Back-reference — this is the required advanced regex pattern.

| Input | Result |
|---|---|
| `Weekly lab session` | ✅ Pass |
| `the the session` | ❌ Fail (duplicate "the") |
| `Meet Meet on Monday` | ❌ Fail |
| `Final finals exam` | ✅ Pass (different words) |

---

### 7. Search Highlighting (in `main.js`)

```js
const regex = new RegExp(searchText, 'gi');
element.innerHTML = text.replace(regex, match => `<mark>${match}</mark>`);
```

**Purpose:** Wraps each matching substring in a `<mark>` tag for accessible visual highlighting. The `RegExp` constructor is wrapped in a `try/catch` so that malformed regex patterns from the user don't crash the application — the search simply falls back gracefully.

Case-sensitive mode bypasses the regex and uses a plain `.split().join()` replacement instead, which avoids regex special-character issues entirely.

---

## Keyboard Map

### Global Section Navigation (Shift + key)

| Shortcut | Action |
|---|---|
| `Shift + H` | Go to Dashboard |
| `Shift + W` | Go to Create Event |
| `Shift + S` | Go to Statistics |
| `Shift + X` | Go to Settings |
| `Shift + A` | Go to About |

### Import / Export Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + I` | Trigger JSON import file picker |
| `Alt + X` | Trigger JSON export / download |

### Standard Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Move focus forward through all interactive elements |
| `Shift + Tab` | Move focus backward |
| `Enter` / `Space` | Activate focused button or link |
| `Arrow keys` | Navigate `<select>` dropdowns |
| `Escape` | Browser default (closes open dialogs) |

### Skip Link

When focused (via Tab from the top of the page), a **"Skip to main content"** link appears. Activating it moves focus directly to `<main>`, bypassing the sidebar navigation entirely — essential for screen reader and keyboard-only users.

---

## Accessibility Notes

### Semantic HTML

The app uses proper landmark elements throughout:

- `<aside role="navigation">` — sidebar navigation
- `<header role="banner">` — mobile top bar
- `<main id="main-content" tabindex="-1">` — main content area (receives programmatic focus on section switch)
- `<section aria-labelledby="...">` — each page section labelled by its visible `<h1>`
- `<footer>` — bottom navigation for mobile
- `<article role="listitem">` — individual event cards
- `<nav>` — wraps sidebar navigation list

### Headings

Each section has a single `<h1>` as its primary heading. Card titles use `<h3>` (under the implicit `<h2>` level of the cards region). Heading order is never skipped.

### Labels & Inputs

Every `<input>`, `<select>`, and `<textarea>` has a bound `<label>` using `for`/`id` pairs. Screen reader-only labels (`.sr-only`) are used where a visible label would be visually redundant (e.g. the search input).

### ARIA Live Regions

Two live regions are present at all times in the DOM:

| Element | `role` | `aria-live` | Used For |
|---|---|---|---|
| `#status-message` | `status` | `polite` | Non-urgent status updates |
| `#alert-message` | `alert` | `assertive` | Urgent alerts (e.g. cap exceeded) |

Additionally, each form field has its own inline `role="alert" aria-live="polite"` error span and a `role="status" aria-live="polite"` success span, so validation feedback is announced immediately without requiring form submission.

The weekly cap banner (`#cap-banner`) uses `aria-live="assertive"` and `role="alert"` so screen reader users are immediately informed when the cap is reached or exceeded.

### Focus Management

When the user switches sections (via nav or keyboard shortcut), `showSection()` in `ui.js` moves focus to `#main-content`. This prevents keyboard users from being stranded inside the sidebar after navigating.

### Visible Focus Styles

All interactive elements have clearly visible `:focus-visible` outlines defined in `main.css`. The default browser outline is never suppressed without a custom replacement.

### Colour Contrast

Text and icon colours are chosen to meet or exceed WCAG AA contrast ratios against their backgrounds. Muted text uses `var(--muted)` only for non-essential supplementary information. The `<mark>` highlight element is styled with sufficient contrast against both the mark background and the surrounding card background.

### Icons

All Font Awesome icons carry `aria-hidden="true"` to hide them from assistive technology. Meaningful button labels are provided either by visible text or `aria-label` attributes.

### Mobile Bottom Navigation

A fixed bottom `<nav>` replicates the sidebar navigation for small screens. Each button has an `aria-label` and `aria-current` attribute managed by `ui.js` on every section switch.

---

## Setup & How to Run

No build tools, package manager, or server configuration is required.

### Option 1 — Open Directly (Quickest)

Because the app uses ES modules (`type="module"`), most modern browsers **require** a local server or GitHub Pages to load the scripts. Simply double-clicking `index.html` will produce CORS errors in most browsers.

### Option 2 — VS Code Live Server (Recommended for Local Dev)

1. Install the **Live Server** extension in VS Code.
2. Open the project folder in VS Code.
3. Right-click `index.html` → **Open with Live Server**.
4. The app opens at `http://127.0.0.1:5500`.

### Option 3 — Python Simple Server

```bash
# Navigate to the project directory
cd Summative-Assesment-CLP

# Python 3
python -m http.server 8080

# Then open: http://localhost:8080
```

### Option 4 — GitHub Pages (No local setup needed)

Visit the live deployment directly:
**https://ApongsehIyan23.github.io/Summative-Assesment-CLP**

---

## How to Use the Application

### Adding an Event

1. Click **"Add Event"** on the Dashboard, or navigate to **Create Event** from the sidebar (or press `Shift + W`).
2. Fill in all required fields — the form validates in real time:
   - **Title** — no leading/trailing spaces, no `< > " `` ` characters
   - **Date** — must be in YYYY-MM-DD format, year 2020–2040
   - **Duration** — a number between 0 and 100, up to 2 decimal places
   - **Tag** — letters only, hyphens and spaces allowed as separators
   - **Description** — optional; will flag duplicate consecutive words
3. Click **Save Event**. The card appears immediately in the Dashboard grid and stats update automatically.

### Editing an Event

1. Find the event card in the Dashboard.
2. Click the **Edit** (pen icon) button on the card.
3. The Create Event form pre-fills with the event's current values and the submit button changes to **"Update Event"**.
4. Make your changes and click **Update Event**. The page reloads to reflect the updated data.

### Deleting an Event

- **Single event:** Click the **Delete** (trash icon) button on the card and confirm the dialog.
- **All events:** Go to **Settings** → click **"Clear All Events"** → confirm the dialog.

### Searching Events

The search bar is at the top of the Dashboard event grid. As you type, cards that do not match are hidden and matching text inside the visible cards is highlighted in yellow using `<mark>` tags.

- Toggle **"Case Sensitive"** to switch between case-insensitive (default) and exact-case matching.
- Clear the search bar to restore all cards.

### Sorting Events

Use the **Sort** dropdown next to the search bar. Available options:

| Option | Behaviour |
|---|---|
| Newest First | Sort by `createdAt` descending |
| Oldest First | Sort by `createdAt` ascending |
| Title A → Z | Alphabetical ascending |
| Title Z → A | Alphabetical descending |
| Duration (High → Low) | Numeric descending |
| Duration (Low → High) | Numeric ascending |

---

## Import / Export

### Exporting Events

- Click **Export** in the sidebar footer, or press **`Alt + X`**.
- A `.json` file is downloaded with the filename `campus-events-YYYY-MM-DD.json`.
- The file contains the full array of event objects as stored in `localStorage`.

### Importing Events

- Click **Import** in the sidebar footer, or press **`Ctrl + I`**, then select a `.json` file.
- The importer validates:
  1. The file is valid JSON.
  2. The top-level structure is an array.
  3. Each object has exactly the expected keys: `title`, `date`, `duration`, `tag`, `description`.
  4. Each field value passes its corresponding regex validation rule.
- Records that pass all checks are added to the existing events (they do not replace existing data).
- Records that fail validation are skipped and an error summary is shown. Detailed errors are logged to the browser console.

### seed.json

A `seed.json` file is included in the repository root with **10+ diverse sample records** — covering edge-case dates, varied durations (decimals, whole numbers, zero), multi-word hyphenated tags, and longer descriptions. Use it to quickly populate the app during demos:

1. Open the app.
2. Press `Ctrl + I` (or click Import).
3. Select `seed.json`.
4. All valid records will be loaded instantly.

---

## Settings

Navigate to **Settings** (`Shift + X`) to configure:

| Setting | Description |
|---|---|
| **Duration Unit** | Choose between **Hours** (default) and **Minutes**. This preference is saved to `localStorage` and persists across sessions. |
| **Weekly Event Cap** | Set an integer cap for how many events you want to schedule per week. When the total number of events reaches or exceeds the cap, an ARIA assertive alert banner appears on the Statistics page. |
| **Clear All Events** | Permanently deletes all events from `localStorage` after a confirmation dialog. |
| **Import JSON** | Opens the file picker to import events from a `.json` file. |
| **Export JSON** | Downloads the current events as a `.json` file. |

---

## Design Decisions

### Why ES Modules instead of a single script file?

The assignment rubric explicitly requires modular code. ES modules (`type="module"`) enforce true encapsulation — each file exports only what it needs to, preventing accidental global variable pollution. The module graph is: `main.js` → `ui.js`, `validators.js`, `storage.js`, `eventManipulation.js`. `storage.js` and `eventManipulation.js` have a circular import (`storage` imports `clearEvents` from `eventManipulation` to use in `deleteAllEvents`), which is intentional to keep the storage layer's public API self-contained.

### Why a back-reference for description validation?

The assignment required at least one advanced regex pattern (lookahead/behind or back-reference). A back-reference (`\b(\w+)\s+\1\b`) was chosen for the description field because it has a clear, meaningful user-facing purpose: catching accidental duplicate words like "the the" or "and AND" — a realistic quality check for an event description.

### Why `isSafe()` runs before every validator?

Rather than embedding XSS guards into every individual pattern (which would make them harder to read and maintain), a single `isSafe()` pre-check strips any input containing `< > " `` ` before domain-specific patterns run. This separation of concerns makes each validator's intent clearer.

### Why is `location.reload()` used after edits?

When an event is edited, multiple parts of the UI need to update simultaneously: the card's display, the stats panel, the chart, and potentially the sort order. Rather than surgically patching each piece of state, a full page reload provides a clean, consistent reset. Since all data lives in `localStorage`, nothing is lost. For the scope of this assignment, this is a deliberate pragmatic trade-off over complexity.

### Why does `updateEventById` not update `createdAt`?

The `createdAt` timestamp is displayed on the card face as "Created At" — changing it on edit would mislead the user into thinking the event was newly created. Only the data fields are overwritten; the original creation time is preserved as an immutable audit trail.

### Why random colours for card headers?

Assigning a random colour from a curated 6-colour palette at creation time gives the event grid a visually distinct, scannable appearance without requiring the user to choose a colour. The palette colours are all verified against the card's white text for adequate contrast.

### Why Lodash for `_.countBy` in the weekly chart?

The `setupWeeklyEvents()` function uses `_.countBy()` from Lodash CDN to aggregate how many events fall on each of the next 7 days. Lodash is permitted under the assignment constraints (only React/Bootstrap-style UI frameworks are excluded), and `_.countBy` reduces several lines of manual reduce/accumulator logic to a single expressive call — making the intent of the code clearer.

### Why `location.reload()` is called after importing?

After importing, stats, charts, and the cap banner all need to update. Rather than manually re-invoking every update function (introducing the risk of missing one), `updateStats()` is called explicitly after import and the DOM is updated card-by-card in the same operation — keeping things consistent without a reload in the import case.

---

## How to Run Tests

A dedicated `tests.html` file is included in the repository root. It runs small in-browser unit assertions against all validator functions.

**Steps:**

1. Start a local server.
2. Navigate to `http://localhost:8080/tests.html` (or the equivalent Live Server URL).
3. The page renders a pass/fail report for every test case directly in the browser — no build step or test runner required.

**What is tested:**

- `isSafe()` — safe strings pass, strings with `< > " `` ` fail
- `validateTitle()` — leading/trailing space cases, minimum length, safe characters
- `validateDate()` — valid YYYY-MM-DD dates, invalid months, invalid years, wrong separators
- `validateDuration()` — 0, integers, decimals, edge of range (100), over-range, negative
- `validateTag()` — single words, hyphenated tags, spaced tags, numeric rejection
- `validateDescription()` — clean sentences pass, duplicate consecutive words fail, case-insensitive duplicates fail

---

## Contact

| | |
|---|---|
| **GitHub** | [github.com/ApongsehIyan23](https://github.com/ApongsehIyan23/Summative-Assesment-CLP) |
| **Email** | a.foghang@alustudent.com |

---

*Campus Life Planner — Summative Assessment, Building Responsive UI*
