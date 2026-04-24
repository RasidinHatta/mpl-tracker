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
> **Data source:** `actions/mpl/standings.ts` → `getRemainingMatches()`

The **Bracket Chances** tab uses a **Monte Carlo simulation** (10,000 iterations) to estimate each team's probability of reaching:

- 🥇 **Upper Bracket** — Top 2 at the end of the regular season
- 🏆 **Playoff** — Top 6 at the end of the regular season

### Input data

| Input | Source |
|---|---|
| Current standings | `getStandings()` — match points, net game wins per team |
| Remaining match schedule | `getRemainingMatches()` — pairs of teams yet to play |
| Win probability | `winProbA = 0.5` (equal, default) — Elo hook ready |

### Algorithm (per iteration)

```
Repeat 10,000 times:

  1. Copy current matchPoints and netGameWin into scratch arrays.

  2. For each unplayed match:
       • Flip a biased coin with P(Team A wins) = winProbA (default 0.5)
       • Sample a BO3-style game delta:
           50% → 2-0 result  (NGW delta = ±2)
           50% → 2-1 result  (NGW delta = ±1)
       • Winner gets +1 match point; both NGW scores are updated.

  3. Sort teams: matchPoints DESC, then netGameWin DESC
     (identical tiebreaker to the live standings table).

  4. Tally:
       • Top-2 finish  → +1 to Upper Bracket counter
       • Top-6 finish  → +1 to Playoff counter

Final probability = counter / 10,000 × 100  (displayed to 2 d.p.)
```

### Edge cases

| Condition | Result |
|---|---|
| No remaining matches | Season is over — exact 100% / 0% from current order |
| Team mathematically impossible (simulation never finishes high) | Naturally produces 0.00% |
| Team mathematically clinched (simulation always finishes high) | Naturally produces 100.00% |

### No artificial clamping

Unlike the previous heuristic, probabilities are **pure simulation outputs** — a 1st-place team with a huge lead can show 98–100%, and an eliminated team shows exactly 0.00%.

### Elo extension point

`getRemainingMatches()` returns `winProbA: 0.5` for all matches. To enable Elo-weighted probabilities, replace that constant with a derived formula — `computeChances()` requires no changes.

### Performance

- 10 teams × 50 remaining matches × 10,000 iterations ≈ 5 million RNG calls
- `Float64Array` scratch buffers are reused each iteration (no GC pressure)
- Runs entirely client-side in < 50 ms on modern hardware

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
