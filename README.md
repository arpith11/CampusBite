# hackathon_01 — CampusBite (Canteen Queue & Pre-Order System)

> Attending our first Hackathon in college • **Frontend Workspace**

Standalone, zero-dependency, modular frontend built for a 5-hour college hackathon. Runs out-of-the-box offline with `localStorage` persistence and cross-tab sync, and connects cleanly to your backend REST/WebSocket APIs by flipping one constant (`USE_MOCK_API = false`) in [`src/services/apiClient.js`](src/services/apiClient.js).

## Quick Start (Zero Build Step)

Because this app uses native ES Modules (`<script type="module">`), serve the folder over HTTP:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in Chrome/Edge (or `http://localhost:8080/#staff` for the PIN-protected Staff & Manager Portal, demo PIN `1234`).

> **Tip for Multi-Screen Pitch Demos:** Open `http://localhost:8080` in **Window 1 (Student)** and `http://localhost:8080/#staff` in **Window 2 (Kitchen KDS / Manager)**. Updates sync live across tabs via `localStorage` events!

## Folder Architecture

- `index.html` — Entry shell
- `styles/tokens.css`, `styles/main.css` — Obsidian & Forest Emerald dark glassmorphic tokens, slot-first mobile layout & wide KDS/Manager grids
- `assets/dishes/` — High-contrast dish photography thumbnails (with inline SVG fallbacks in `foodArt.js`)
- `src/services/apiClient.js` — Centralized REST + WebSocket client (`const USE_MOCK_API = true;`)
- `src/data/mockSeed.js` — Seeded campus menu, 10-minute slots, and sample KDS orders
- `src/utils/nlpOrderParser.js` — Plain-language ordering parser (quantities, dishes, aliases, typos, dine-in/takeaway, slots)
- `src/utils/qrGenerator.js`, `src/utils/foodArt.js`, `src/utils/icons.js` — Zero-network QR SVGs, dish art & icons
- `src/views/` — `StudentView.js`, `StaffLoginView.js`, `KitchenView.js`, `ManagerView.js`
- `src/components/` — `Header.js`, `OrderReadyBanner.js`, `CartDrawer.js`, `DishDetailModal.js`
- `API_CONTRACT.md` — Exact JSON REST & WebSocket contract for backend teammates

## Judge Pitch Script

1. **Plain-Language Ordering:** In Student view, click `"2 masala dosa and 1 cold coffee for 12:30 dine-in"` or type your own prompt — watch items, slot, and dine-in mode populate automatically.
2. **Load-Balanced Slots & Auto-Suggestion:** Click **"Demo: Fill 12:30 (9/10)"** in the header -> `12:30` turns Amber (`9/10`). Place 1 order -> `12:30` hits `10/10` Red & Locked. Click `12:30` -> automatically suggests and highlights `12:40`.
3. **Live Kitchen Display (KDS):** Open **Staff Portal** (`#staff`, PIN `1234`) -> choose `Kitchen Staff` -> inspect the **Batch-Cooking Aggregator** (`12:30 Batch: ...`) and click **"Mark Ready"** on ticket `#4821` -> the pulsing **"Order Ready!"** banner immediately triggers for the student.
4. **Manager Real-Time Slots & Stock Controls:** Switch to `Canteen Manager` -> monitor all 4 booked windows (`12:20`–`12:50`) with the live `T1–T10` table map, toggle items `Out of Stock` / `New Update`, or publish a brand-new dish and immediately order it via plain language in Student view.
