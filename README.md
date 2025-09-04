# Vue 3 + Vite Wholesale Matchmaking App

A Vue 3 + Vite app that uses Vuetify, Vue Router, and Pinia. Based on the code you shared, it also includes a **mocked "Wholesale Matchmaking"** experience (product loader, CTA logic, and a sidebar of matches).

## Requirements

* **Node.js ≥ 18** (Vite 5 requirement)
* **Yarn** (commands below use Yarn)

## Getting Started

```bash
# install deps
yarn install

# start the dev server
yarn dev

# build for production
yarn build

# preview the production build locally
yarn preview

# lint & auto-fix
yarn lint
```

Vite will print the local dev URL (typically `http://localhost:5173`).

## Tech Stack

* **Vue 3**, **Vite 5**
* **Vuetify 3** + **@mdi/font**
* **Vue Router 4**, **Pinia 2**
* **axios**, **moment**, **vue3-cookies**
* Data viz & export available: **chart.js**, **vue-chartjs**, **html2canvas**, **jspdf**, **jspdf-autotable**
* SDKs present (optional): **@stripe/stripe-js**, **openai**
* Tooling: **eslint**, **eslint-plugin-vue**, **prettier**, **sass**, **vite-plugin-vuetify**

## Scripts (from `package.json`)

| Script | What it does |
|--------|--------------|
| `yarn dev` | Run Vite dev server |
| `yarn build` | Build for production |
| `yarn preview` | Preview the production build |
| `yarn lint` | ESLint with `--fix` (uses `.gitignore`) |

## Matchmaking Demo (from your snippet)

This is a lightweight, mocked flow to showcase the sidebar and details panel.

* **Product loading**: `loadProduct()` returns mocked products (with base64 images) and sets timestamps (`createdAt`, `lastEditedAt`) for CTA logic.
* **CTA logic**:
   * `updatedSinceLastRun` compares `product.lastEditedAt` with `matchStatus.lastRunAt`.
   * `ctaLabel` is:
      * `"Find Wholesale Matches"` if the product changed since last run
      * `"Edit and Run Matchmaking"` otherwise (routes to `name: 'Dashboard'` with `{ editId, afterMatch }`)
* **Running matchmaking**: `runMatchmaking()` simulates latency, then seeds a few matches and auto-selects the most recent one. A toast is shown via the injected `show()` function.
* **Empty vs. populated state**: you can mock an empty sidebar for a specific product id if desired (e.g., `id=p_1002` → `matches=[]`; otherwise seed matches).

## Match object shape

All matches are created by `mkMatch(storeName, ts, notes, score)` and include:

```javascript
{
  id: `m_${Math.random().toString(36).slice(2)}`,
  storeName,
  createdAt: new Date(ts).toISOString(),
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName + ' store')}`,
  address: '',
  phone: '',
  website: '',
  category: 'Apparel',
  buyerContact: '',
  notes,
  score
}
```

If you want fuller mock records, you can extend `mkMatch` to accept optional overrides (address/phone/website/buyerContact/category) and merge them into the return object.

## Environment Variables (optional)

If you wire real services, Vite exposes variables prefixed with `VITE_`:

```env
# .env.local (not committed)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_OPENAI_API_KEY=sk-...
```

These are **not required** for the mocked flow.

## Notes / Troubleshooting

* Ensure **Node ≥ 18**.
* If Vuetify styles don't load, verify the Vuetify plugin is registered and styles are imported in your app entry.
* If routing is involved, check that the router mounts to `#app` and that routes/components are registered.

## License

Add your license here (e.g., MIT).