# MPL Tracker

A full-stack web application for tracking **Mobile Legends: Bang Bang Professional League (MPL)** standings, match history, and user predictions — supporting **MPLID**, **MPLPH**, and **MPLMY** regions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via [Prisma ORM](https://www.prisma.io/) |
| Auth | [Better Auth](https://better-auth.com/) |
| UI | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS |
| Package Manager | pnpm |

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Run database migrations

```bash
pnpm prisma migrate dev
```

### 4. (Optional) Seed the database

```bash
pnpm prisma db seed
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features

### Multi-region support
The tracker supports three MPL regions simultaneously, selectable via a `?group=` URL search parameter that is preserved across all navigation:

- `MPLID` — Indonesia
- `MPLPH` — Philippines  
- `MPLMY` — Malaysia

### Authentication & Roles
Built on **Better Auth** with two roles:

- `USER` — Can view standings, history, and submit match predictions.
- `ADMIN` — Can create matches and input actual match results.

### Pages

| Page | Description |
|---|---|
| `/` | Landing page with feature overview |
| `/schedule` | Weekly match schedule. Admins can add matches and update results. |
| `/standing` | Live standings table + Bracket Chances tab |
| `/history` | Head-to-Head matrix + per-team match breakdown |
| `/predict` | Submit score predictions for upcoming matches |

---

## Data Model

### `Team`
Represents a competing team. Each team belongs to one `MatchGroup` (region).

### `Match`
A single scheduled match between two teams (`teamA` vs `teamB`). Results are stored as game counts (e.g., `teamAResult = 2`, `teamBResult = 1` for a 2-1 BO3 win).

Key fields:
- `week` / `day` — Schedule positioning
- `format` — `BO3`, `BO5`, or `BO7`
- `group` — Region (`MPLID`, `MPLPH`, `MPLMY`)
- `teamAResult` / `teamBResult` — `null` when not yet played

### `UserPrediction`
One prediction per user per match. Stores predicted game scores for both sides. Used in the "forecast" standing view.

---

## Standings Calculation

> **Source:** `actions/mpl/standings.ts` → `getStandings()`

### Scoring rules

| Metric | Calculation |
|---|---|
| **Match Point** | = number of match wins |
| **Net Game Win** | = total game wins − total game losses |
| **Match W-L** | Wins and losses counted from game scores (higher score wins the match) |

### Sort order (tiebreaker)
Teams are ranked by:
1. **Match Points** (descending) — primary sort
2. **Net Game Win** (descending) — tiebreaker

### Prediction mode
`getStandings(usePredictions: true)` overlays a user's saved predictions onto unplayed matches, giving a *forecasted* standing view. An optional `forecastWeek` parameter restricts the overlay to a specific week only.

---

## Bracket Chances Calculation

> **Source:** `components/mpl/standing-tabs.tsx` → `computeChances()`

The **Bracket Chances** tab estimates each team's probability of reaching:

- 🥇 **Upper Bracket** — Top 2 teams at the end of the regular season
- 🏆 **Playoff** — Top 6 teams at the end of the regular season

### Key variables

| Variable | Meaning |
|---|---|
| `currentPts` | Team's current match points |
| `remaining` | Matches not yet played (`totalMatches − played`) |
| `maxPts` | Best possible final points (`currentPts + remaining`) |
| `thresholdTeam` | The team sitting exactly at the cutoff (rank 2 for UB, rank 6 for PO) |
| `firstOutside` | The first team just outside the zone |

### Algorithm

```
For each zone (UB_SPOTS = 2, PO_SPOTS = min(6, n)):

  IF no matches have been played yet:
    → All teams get an equal-split estimate (~50% for in-zone, proportional for others)

  ELSE IF team is currently INSIDE the zone (rank ≤ spots):
    IF no team outside can possibly catch up → 100%
    IF first-outside team can never overtake even winning all remaining:
       → 100%  (mathematically clinched)
    OTHERWISE:
       lead = currentPts − firstOutside.matchPoints
       raw  = lead / (lead + theirRemaining + 1)
       result = clamp(raw × 100, min=55, max=99)

  ELSE IF team is currently OUTSIDE the zone (rank > spots):
    IF maxPts < thresholdTeam.matchPoints → 0%  (mathematically eliminated)
    IF remaining == 0                     → 0%  (season over, didn't qualify)
    OTHERWISE:
       gap = thresholdTeam.matchPoints − currentPts
       raw = max(0, (remaining − gap) / (remaining + 1))
       result = clamp(raw × 60, min=0, max=49)
```

### Design decisions

- **Clamping to [55, 99] for inside-zone teams** — A team inside the zone is *never shown at 100%* unless mathematically guaranteed, and is never shown *below 55%* since they have a structural advantage.
- **Clamping to [0, 49] for outside-zone teams** — An outside team is always shown *below 50%* to reflect that they are climbing uphill. A 0% is only shown when mathematically impossible.
- **Floating-point display** — All percentages are rendered to 2 decimal places (`toFixed(2)`).

### Color coding

| Range | Color | Meaning |
|---|---|---|
| ≥ 90% | 🟢 Green | Very likely / near-certain |
| 50–89% | 🟡 Amber | In contention |
| 1–49% | ⚫ Muted | Possible but unlikely |
| 0% | 🔴 Red | Mathematically eliminated |

---

## History Page

> **Source:** `components/mpl/history-tabs.tsx`

Two sub-tabs:

### Head-to-Head Matrix
A grid showing completed match results between every pair of teams. Each cell shows the game score of their encounters.

### Team Matches
A per-team breakdown filtered by a team selector dropdown. Shows:
- **Completed matches** — with result (WIN / LOSS / DRAW), score, opponent, and date
- **Remaining matches** — with opponent and "Upcoming" indicator
- **Quick stats bar** — total matches, wins, losses, and matches remaining

---

## Admin Features

### Match Management
Admins (role = `ADMIN`) see an **Add Match** button on the schedule page. The dialog allows selecting:
- Week, day, date
- Team A and Team B (filtered by the current region)
- Match format (BO3 / BO5 / BO7)

### Result Entry
Admins can update match results inline. Results are stored as raw game counts and immediately reflected in standings.

---

## Development Notes

- The `?group=` search parameter is appended to all internal links (sidebar, footer, breadcrumbs) so the selected region is always preserved on navigation.
- Standings are computed server-side on every page load — no caching, always fresh.
- Bracket chances are computed client-side in `computeChances()` from the standings array passed as props.
