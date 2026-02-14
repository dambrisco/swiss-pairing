# Plan: Home/Away (Color) Tracking

## Overview

This document describes the plan to add color-balance tracking to the swiss-pairing library. In Swiss System chess, each player should play an equal number of games as home (white) and away (black). Alternating each round is preferred, and the same side must never be assigned three rounds in a row.

The library already uses `home`/`away` as the field names throughout — in match input, matchup output, and internal mappings. This plan reuses that convention: **`home` = white pieces, `away` = black pieces**. Color assignment becomes the primary driver of which player occupies each side, replacing the current rule that `home` is always the higher-ranked player.

### Rules to enforce

1. **Balance** (soft): Each player should play an equal number of games as `home` and `away` over the course of the tournament.
2. **Alternation** (soft): Colors should alternate each round where possible.
3. **No triple repeat** (hard): A player must never be assigned the same side three rounds in a row.

---

## Step 1 — Track Color History in `getMappings`

**File:** `index.js` — `getMappings` function

Add a `colorsPlayed` array to each participant's internal mapping object. Since the match input format already records `home` and `away` by player ID, color history is fully derivable from existing data without any input format change:

```javascript
// inside the match reduction:
if (match.home.id === participant.id) {
  acc.points += match.home.points
  acc.opponents.push(match.away.id)
  acc.colorsPlayed.push('home')
} else if (match.away.id === participant.id) {
  acc.points += match.away.points
  acc.opponents.push(match.home.id)
  acc.colorsPlayed.push('away')
}

// initial accumulator value gains one new field:
{ id, seed, droppedOut, points: 0, opponents: [], colorsPlayed: [] }
```

Two derived values are computed per participant before the blossom phase:

- **`colorImbalance`**: `homesPlayed - awaysPlayed` — positive means the player has played home more often and is due away; negative means due home.
- **`lastTwoColors`**: the final two entries of `colorsPlayed` — if both are identical, the player is **forced** to switch (hard constraint, no exceptions).

---

## Step 2 — Add a `colorWeight` Option

**File:** `index.js` — factory function options block

```javascript
options.colorWeight = options.colorWeight || 3
```

This weight governs how much the blossom algorithm penalizes pairing two players who both need the same side. Setting it to `0` disables color-aware pairing entirely, preserving exactly the current behavior as an escape hatch.

---

## Step 3 — Add Color Compatibility to Blossom Edge Weights

**File:** `index.js` — `getMatchups`, the `arr` reduction (currently lines 123–136)

Compute a color compatibility penalty for each candidate pair and include it in the edge weight:

```javascript
// Returns 1 if both players are due the same side, 0 if complementary or unknown
const colorConflict = (a, b) => {
  if (!a.colorDue || !b.colorDue) return 0
  return (a.colorDue === b.colorDue) ? 1 : 0
}

// Updated weight formula:
-1 * (
  Math.pow(team.points - opp.points, options.standingPower) +
  options.rematchWeight * rematchCount +
  options.colorWeight * colorConflict(team, opp)
)
```

Where `colorDue` is `'home'` if `colorImbalance < 0`, `'away'` if `colorImbalance > 0`, and `null` if balanced. This nudges the blossom solver toward pairings where one player needs home and the other needs away, while still prioritizing score proximity and rematch avoidance.

---

## Step 4 — Post-Pairing Color Assignment

**File:** `index.js` — `getMatchups`, the result-extraction loop (currently lines 155–164)

After the blossom algorithm returns its pairs, determine which player is `home` and which is `away` for each matchup using this priority order:

1. **Hard constraint first**: If either player has played the same side for the last two rounds, they *must* receive the other side. If both players are simultaneously forced to the same side (unavoidable with some color histories), the player with the larger `|colorImbalance|` wins the dispute; the other player's soft preference is violated but the hard constraint for the first player is preserved.
2. **Soft preference**: Give `home` to the player with `colorImbalance < 0` (more aways played), and `away` to the player with `colorImbalance > 0` (more homes played).
3. **Tie-break**: If both players have equal imbalances, give `home` to the lower-ranked player. This is a deliberate inversion of the current rule (which always gives `home` to the higher-ranked player) to ensure top players do not accumulate a home advantage.

BYE matchups assign `home` to the active participant and `away` to `null`, matching the existing convention.

---

## Step 5 — Tests

Add test cases to `test/test.js` covering:

- A player who has played `home` for the last two consecutive rounds is assigned `away` next round (hard rule enforcement).
- A player with more `home` games than `away` games receives `away` when possible (soft balance).
- The `colorWeight: 0` option produces matchup pairings identical to the current behavior (regression guard).
- BYE matchups have the correct `home`/`away` structure (`away: null`).
- `colorsPlayed` in `getMappings` output reflects the correct sequence of sides for a player across multiple rounds.

---

## Breaking Change Analysis

| Change | Breaking? | Notes |
|---|---|---|
| New `colorWeight` option with default | **No** | Additive. Existing callers do not pass it; the default `3` is a small weight unlikely to substantially alter pairings. Callers requiring zero-delta behavior can set `colorWeight: 0`. |
| `colorsPlayed` field added to `getMappings` output | **Technically yes** | `getMappings` is a publicly exported method. Its return type is widened. Any caller checking the exact shape of mapping objects will see a new field. This is additive in practice but constitutes a public API change. |
| `home`/`away` semantics in `getMatchups` output | **Yes — the most significant change** | Currently `home` is guaranteed to be the higher-ranked player. After this change, `home` is the player assigned white pieces based on color history. The higher-ranked player may be `away`. Any caller relying on `home` as a rank signal will be broken. |
| Match input format | **No** | The plan reuses the existing `home`/`away` fields to derive color history retroactively. No new required fields. |

### The retroactive data concern

Because the plan derives `colorsPlayed` from historical `home`/`away` fields, it assumes those fields were color-intent-aware from the start. For tournaments that recorded match results before this feature existed — where `home` was assigned purely by ranking with no color intent — the derived color history will be incorrect and early-round color assignments may be skewed until the balance self-corrects.

**Mitigation options for the library owner to consider:**

1. Accept this as a documented limitation for in-progress tournaments migrating to this version.
2. Add an optional `colorOverride` field to the match input format (e.g., `home.color: 'home' | 'away'`) so callers can supply authoritative color data for pre-existing rounds, with `home`/`away` position used as the fallback.
3. Document that reliable color tracking requires tournaments to be started fresh on this version or later.
