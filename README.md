# POINTX (SCB) × Dynamic Yield — App Demo

A high-fidelity, clickable prototype of SCB's **POINTX** points app, personalised by **Dynamic Yield** (balance-aware sorting, merchandising rules, real-time affinity, generative banners) with a conversational **POINTX assistant** powered by **Shopping Muse**.

It reuses the architecture, interaction model and presenter tooling of the [The 1](https://github.com/jlin92/central-the1-th), [Telstra Plus](https://github.com/jlin92/telstra-au) and [MTN MoMo](https://github.com/jlin92/mtn-momo-dy) prototypes (React + TypeScript + Vite + Tailwind + framer-motion; chapters, persona context, presenter rail, "Why shown now" rail). The visual layer replicates the POINTX app: lavender home with `Hi NAME`, the ⊗ points line, quick actions (Partner Points · My Coupon · Cashback · Airlines · XTravel), hero banner, *All Promotions* band, *Wealth Wonders* / *Flash Deal* / *Special Deal* / *Apple Top Picks* / *e-Coupon* / *Eat Around* / *Trending Now (Like this? ✓ ✕)* / *My Missions* / *Partner Points Transfer* / *New Arrival* shelves, the Shops and X Store tabs with emoji category tabs, item cards with `-10%`, Baht price, pink ⊗ points price with strikethrough, `20 left` and `Point+Money ฿` tags, the deep-purple *My POINTX* tab with the partner list, and the central **SCB scan** button.

## Run it

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20   # Node ≥ 20.19
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build
npm run catalogue    # regenerate src/mock-data/catalogue.json + feed/*.csv
```

> Behind a corporate TLS proxy: `npm install --cafile=<your-ca-bundle.pem>`.

## Controls

| Key / control | What it does |
|---|---|
| `P` or **Presenter** button | Presenter panel: persona switch, DY controls, persona story, screen jumper, reset |
| `T` | Toggle **"POINTX today"** (newest-first, no filtering — the current app) vs Dynamic Yield sorting |
| **Why this?** / **Why this order?** in the app | Opens the reasoning rail: signals, treatment on this screen, live affinity and ✓/✕ feedback, and the **sorting optimiser board** (weighted factors + what merchandising rules filtered out) |
| Banner variant **A / B / C** | Switch the generative banner creative for the persona |
| **SCB scan button** | Simulated scan & pay: pick a shop, pay with POINTX (Point+Money) or SCB EASY, earn points back, progress missions |

See [DEMO_FLOWS.md](DEMO_FLOWS.md) for the two scripted journeys.

## What is personalised (and where)

POINTX is a *burn-heavy* programme — everything costs points, `Point+Money` splits the bill, and members earn through scan & pay points-back, partner transfers, missions and SCB card spend. The use cases below were chosen for that shape.

| Use case | Where to see it |
|---|---|
| **Balance-aware ranking (reach)** — within-your-points first, stretch items shown as Point+Money with the exact cash top-up, never hidden | *Picked for you*, X Store category pages, item detail, assistant answers |
| **Earn ↔ burn nudging** — low balance → missions, points-back shops and partner transfers promoted; large / expiring balance → best value-per-point redemptions | Mint's home (Missions + Partner Transfer high), Korn's *Use your expiring points* shelf |
| **Real-time in-session affinity** — browse X Store, open an item, and *Picked for you*, *Trending Now*, category tabs, the hero banner and the assistant re-rank before you leave | Persona 1 flow: X Store → Beauty → item → Home |
| **Explicit feedback → DY** — POINTX's own *Like this? ✓ ✕* cards feed affinity; ✕ removes the item by rule and demotes its category | *Trending Now* |
| **Merchandising rules** — out of stock, expired, already redeemed, already in My Coupon, already joined, ✕-rated, points-only above balance, SCB Wealth-only, cardholder-only, *bought something similar recently* (purchase cadence) | "N hidden" line on X Store / Shops; reasoning rail lists each rule and count |
| **Segment-gated content** — *Wealth Wonders* shelf and Wealth-only items for SCB Wealth; Cashback → "Credit card not found" and card missions hidden without an SCB credit card | Korn vs Mint |
| **Targeted (personal) items pinned on top** | *First Scan & Pay* (Mint), *Pay your SCB card bill with points* (Korn) |
| **Expiring-points urgency** with a concrete personal use | Korn's hero banner, points line chip, *Use your expiring points*, My POINTX balance card |
| **Flash deal / low-stock urgency** | Flash Deal countdown, `Only 3 left` reasons |
| **Generative banners** — 3 variants per persona (A/B/C) plus a live-generated variant from in-session affinity for the new member | Home hero |
| **Partner-transfer top-ups** — linked partner balances converted into the exact POINTX received, offered when an item is just out of reach | Partner Points Transfer shelf, item detail, assistant |
| **Scan & pay guidance** — which way to pay (points vs SCB EASY) given points-back and expiring points | Scan sheet nudge, assistant "Points or money at Café Amazon?" |
| **Smart search → Shopping Muse** | Type "earbuds", "กาแฟ", "massage", "japan" in X Store or Shops; hand-off card routes the query to the assistant |
| **Shopping Muse: support + commerce** | Education ("How does POINTX work?"), "What can I get with my points?", "How do I earn points fast?", "I want AirPods" (Point+Money + transfer + mission), "Use my expiring points", "Book dinner this weekend", "Plan a Japan trip", "I want the MacBook Neo", gifting, points-back shops, flash deals, casual phrasing ("anything good?", "โปร") — all computed live from the feed and the member's balance, wallet, missions, linked partners and ✓/✕ |
| **Compare with today** | `T` flips every list to newest-first/no-filter so the contrast is visible |

## Personas

- **Pimchanok "Mint" Srisuk — new member, first open.** 1,250 welcome points, no SCB credit card, no history, 3,200 AIS Points + 850 The 1 points linked but unused. Cold start on popularity + reach; earn paths promoted; the app re-ranks within the session as she browses and rates; the live banner is generated from her first signals.
- **Kornkanok "Korn" Wattanasin — returning SCB Wealth cardholder.** 186,420 pts (24,000 expiring 31 Dec), Eat Around regular (Copper ×2, mission 2/3), Tokyo via XTravel, Apple fan (AirPods 5 redeemed 6 weeks ago), Café Amazon scan & pay most mornings, Starbucks e-Coupon redeemed last week, 4,400 M Card + 18,000 ROP miles linked. Expiry urgency, affinity + value sorting, Wealth shelf, suppression of what she already has, partner top-up for a MacBook.

## Data

`scripts/build-catalogue.mjs` authors the 172-item catalogue (X Store products, e-Coupons, Eat Around dining, scan-&-pay Shops with points back, Missions, Partner transfers, XTravel/airlines, Donations) modelled on the live app's items and prices (12.5 points = ฿1 standard; `-10%` = 90% of price × 12.5) and writes `src/mock-data/catalogue.json`, stable ids in `catalogueIds.ts`, and a DY-style product feed `feed/pointx_catalogue_dy_feed.csv`. Brand "logos" are rendered as wordmarks on brand colours and products as icon tiles so nothing can 404 in a live demo.

## Structure

```
src/app/            chapters, DemoContext (persona, balance, wallet, missions, transfers, scan & pay, ✓/✕, affinity, sort mode), screens
src/services/       sortEngine (scoring + merchandising rules), selectors (shelves, best value, live banner, earn-the-gap helpers)
src/mock-data/      catalogue.json, offers.ts (brand palette, Shops/X Store tabs, smart-search synonyms, value helpers), appUsers.ts, muse.ts
src/components/     layout (frame, header, bottom nav + SCB scan, scan sheet), offers (cards, tiles), presenter, muse, ui
```

*All balances, points prices, conversion rates and offers are illustrative demo data.*
