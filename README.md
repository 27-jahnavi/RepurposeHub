# RePurpose Hub

**Giving unwanted items a second life.**

A web-based platform that connects people who have usable household items they no longer need with people who will donate, exchange, repair or creatively repurpose them — instead of throwing them away.

> "Don't throw it away. Give it another purpose."

Built as an EVS software prototype using plain HTML, CSS and JavaScript with `localStorage` for data. No build step, no server, no npm install.

---

## Quick start

**Option 1 — just open it**

Double-click `index.html`. That's it. It runs directly from the file system in any modern browser.

**Option 2 — run a local server** (recommended if your browser blocks local file access)

```bash
# Python 3
cd repurpose-hub
python -m http.server 8000
# then open http://localhost:8000
```

```bash
# Node.js
npx serve .
```

**Option 3 — single file**

`dist/repurpose-hub-standalone.html` is the entire app in one file with the CSS and JS inlined. Useful for emailing, submitting, or demoing from a USB drive.

---

## Project structure

```
repurpose-hub/
├── index.html                          # Page shell and app container
├── css/
│   └── styles.css                      # Design tokens, layout, components, responsive rules
├── js/
│   └── app.js                          # All application logic (data, routing, views, storage)
├── dist/
│   └── repurpose-hub-standalone.html   # Everything in one file
├── docs/
│   └── FEATURE_MAP.md                  # Where each spec feature lives in the code
└── README.md
```

---

## Features

| # | Feature | Status |
|---|---|---|
| 1 | User registration and login (name, email, password, location) | Working |
| 2 | Post an unwanted item with photo upload | Working |
| 3 | Four reuse options — Donate, Exchange, Repair, Repurpose | Working |
| 4 | Browse and search with filters | Working |
| 5 | Six item categories | Working |
| 6 | Item condition indicators | Working |
| 7 | "Give It a New Purpose" repurposing ideas | Working |
| 8 | Contact the owner / "I'm interested" | Working |
| 9 | User dashboard | Working |
| 10 | Environmental impact dashboard with charts | Working |

### 1. Registration and login
Accounts are created with name, email, password and a Bengaluru locality. Passwords are stored in `localStorage` in plain text — this is a prototype, not a production auth system. Posting an item or sending a request prompts sign-in first and then resumes the action you were trying to take.

### 2. Post an item
Fields: item name, category, condition, description, reuse option, pickup area, optional contact number, and a photo. Uploaded photos are resized to 700px wide and compressed to JPEG in the browser before being saved, so `localStorage` doesn't overflow. Without a photo, the app draws an SVG illustration based on the category.

Form validation flags empty or too-short fields inline instead of using `alert()`.

### 3. Four reuse options
Every listing carries exactly one: **Donate**, **Exchange**, **Repair** or **Repurpose**. Each has its own colour, used consistently on chips, cards, the post form and the impact charts so the four-way choice is readable at a glance.

### 4. Browse and search
- Live text search across item name, description and category
- Filter by category, condition, reuse option and area
- Sort by newest, oldest or A–Z
- A proper empty state with a reset button when nothing matches

### 5. Categories
Books & Stationery · Furniture · Clothes & Accessories · Electronics · Kitchen Items · Toys & Others

### 6. Condition indicators
| Condition | Meaning |
|---|---|
| New-like | Barely used |
| Good | Usable with minor wear |
| Needs Repair | Requires fixing before use |
| For Creative Repurposing | Better suited for transformation |

### 7. Give It a New Purpose
Nine preloaded repurposing ideas (bottles → planters, tyres → garden seats, crates → shelves, T-shirts → bags, jars → containers, and more). Each opens a modal with difficulty, time estimate and numbered steps, plus a shortcut to list an item for that idea. This content is static by design — no AI recommendation system is required.

### 8. Contact the owner
"I'm interested" opens a message form. The request is saved and appears in the owner's dashboard, where they can accept or decline it. You can't send two requests for the same item, and you can't request your own listing.

### 9. User dashboard
Four tabs: **My listings**, **Requests received**, **I'm interested in**, and **Completed**. Owners can accept or decline requests, mark an item as handed over, or remove a listing. Marking an item handed over closes it and feeds the impact numbers.

### 10. Environmental impact dashboard
- Headline counters: items reused, repurposed, donated, active users
- Six-month activity line chart
- Category-wise reuse bar chart
- Breakdown by reuse option
- A "Platform activity" panel showing only real counts from this browser

Charts are hand-drawn SVG generated in `app.js` — no Chart.js or any other charting library is loaded.

**On the numbers:** the headline counters include illustrative demo values from the project spec (128 reused, 64 repurposed, 42 donated, 85 users) so the dashboard isn't empty during a demo. These are clearly labelled on the page as demo figures, not measured environmental impact. Everything under "Platform activity" is real data from your browser.

---

## Technology used

| Technology | Purpose |
|---|---|
| HTML | Page structure, forms, semantic landmarks |
| CSS | Design tokens, grid and flex layouts, responsive breakpoints, light/dark themes |
| JavaScript | Views, routing, search, filters, validation, charts, all interactivity |
| localStorage | Storing users, items and requests between visits |
| SVG | Category illustrations, hero graphics and both charts |
| Google Fonts | Bricolage Grotesque (headings), IBM Plex Sans (body) |

No frameworks. No build tools. No backend.

---

## How data is stored

Everything lives in the browser under four `localStorage` keys:

| Key | Contents |
|---|---|
| `rph_items_v1` | All item listings, seed and user-created |
| `rph_users_v1` | Registered accounts |
| `rph_session_v1` | The currently signed-in user |
| `rph_requests_v1` | "I'm interested" requests |
| `rph_theme_v1` | Light or dark theme preference |

All reads and writes are wrapped in `try/catch` and fall back to an in-memory object, so the app still works if storage is blocked or full (private browsing, for example).

**To reset the app to a clean state**, open the browser console and run:

```js
localStorage.clear(); location.reload();
```

On first load with no data, the app seeds 14 realistic listings across Bengaluru localities so the site never looks empty during a demo.

---

## Notes for the demo

- Data is per-browser. Opening the project on a different laptop gives you a fresh copy of the seed data.
- Create an account in a few seconds — no email is sent and nothing leaves your machine.
- To show the full loop: sign in → post an item → sign out → register a second account → send a request on that item → sign back in as the first account → accept it → mark it handed over → open the Impact page and watch the numbers move.
- Use the moon icon in the header to switch between light and dark.
- The layout works down to phone width; the nav collapses into a menu below 720px.

---

## Known limitations

These are deliberate scope choices for a prototype, not bugs:

- Passwords are stored unhashed in `localStorage`. Never reuse a real password here.
- No real-time chat — requests use a message form, as the spec allows.
- Photos live in `localStorage` as base64 strings, which caps you at roughly 30–50 images before storage fills up.
- Data doesn't sync between devices or browsers.
- Repurposing ideas are static content, not generated or recommended.
- The demo baseline figures on the Impact page are illustrative, and labelled as such.

---

## If you extend this (Approach B)

The project spec mentions an optional Firebase build. The cleanest path:

1. Replace the `items()`, `setItems()`, `requests()` and `setRequests()` helpers in `app.js` with Firestore reads and writes — they are the only functions that touch storage, so nothing else in the app has to change.
2. Swap `openAuth()` for Firebase Authentication.
3. Upload photos to Firebase Storage and store the download URL instead of the base64 string.
4. The views already re-render from the data layer, so the UI needs no rewrite.

---

## Licence

Coursework prototype. Fonts are served by Google Fonts under the SIL Open Font Licence.
