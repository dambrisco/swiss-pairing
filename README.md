# swiss-pairing

[![NPM version](https://img.shields.io/npm/v/swiss-pairing?logo=npm)](https://npmjs.org/package/swiss-pairing "View this project on NPM")
[![Dependency status](https://img.shields.io/librariesio/github/dambrisco/swiss-pairing?logo=librariesio)](https://libraries.io/github/dambrisco/swiss-pairing "View this project on Libraries.io")
[![CI status](https://img.shields.io/github/actions/workflow/status/dambrisco/swiss-pairing/node.js.yml?logo=github)](https://github.com/dambrisco/swiss-pairing/actions/workflows/node.js.yml?query=branch%3Atrunk "View this project's CI run history")


swiss-pairing is a tiny swiss pairing library with basic deterministic functionality

## Installation

* `npm install --save swiss-pairing`
* `require('swiss-pairing')(options)`
  * `options` contains the following variables:
    * `maxPointsPerRound` - the number of points a participant can score in a
      round - usually 1 or 2
      * default: `1`
    * `rematchWeight` - rematch penalty weight
      * default: `100`
    * `standingPower` - the power to which standings differences should be
      raised
      * default: `2`
    * `seedMultiplier` - the deterministic PRNG seed multiplier, ideally a prime
      of at least 4 digits
      * default: `6781`
    * `colorWeight` - penalty weight applied to the blossom edge when both
      candidates in a pair are due the same side (`home` or `away`). Higher
      values make color balance a stronger pairing criterion relative to score
      proximity. Set to `0` to disable color-aware pairing entirely and restore
      purely score-based pairings.
      * default: `3`
  * See `test/test.js` for usage example

## Usage

swiss-pairing exposes the following four methods:

### getMatchups(round, participants, matches)

See `participants` and `matches` formats below.

Determines the matchups for the given round by pairing participants:

* who have **not** faced each other
* in order of:
  * highest standing to lowest
  * highest modified median score to lowest
  * lowest seed to highest
* where the `home`/`away` side for each pair is assigned by color history (see
  below)

**Color (home/away) assignment** — applied after the blossom pairing algorithm
has decided *who* plays *whom*, using this priority order:

1. **Hard constraint**: a participant who has played the same side for the last
   two consecutive rounds is forced to switch. If both participants in a pair
   are simultaneously forced to the same side, the one with the larger absolute
   color imbalance wins; the other's hard constraint is overridden.
2. **Soft preference**: the participant with more `away` games than `home` games
   receives `home`; the one with more `home` games receives `away`.
3. **Tie-break**: when both participants have equal imbalances, the lower-ranked
   participant receives `home`. This prevents top-ranked participants from
   accumulating a home-side advantage over a long tournament.

> **Breaking change from earlier versions**: prior to color tracking, `home` was
> always assigned to the higher-ranked participant. It may now be assigned to
> either participant based on color history. Set `colorWeight: 0` *and* be aware
> that the post-pairing assignment still applies; callers that relied on `home`
> as a rank signal will need to be updated.

When byes are needed (in the case of an odd number of participants), they bubble
up from the lowest to the highest ranking, (starting with the lowest seed when
no match history is available). Participants cannot have more than one bye. BYE
matchups always assign `home` to the active participant and `away` to `null`.

Matchups returned are in the form:

```javascript
[
  {
    'home': home_participant_id,
    'away': away_participant_id
  },
  ...
]
```

### getStandings(round, participants, matches)

See `participants` and `matches` formats below.

Determines the standings for a given round by accumulating won points and lost
points and calculating modified median scores. Standings are ordered by wins,
modified median score, and (inverse) seed in that order.

Standings returned are in the form:

```javascript
[
  {
    'id': participant_id,
    'seed': seed,
    'wins': won_points,
    'losses': lost_points,
    'tiebreaker': modified_median_score
  },
  ...
]
```

### getModifiedMedianScores(round, participants, matches)

See `participants` and `matches` formats below.

Caculates modified median scores based on the given participants and paired
match history.

Scores returned are in the form:

```javascript
{
  <participant_id>: modified_median_score,
  ...
}
```

### getMappings(participants, matches)

See `participants` and `matches` formats below.

Returns the internal per-participant aggregation used by `getMatchups` and
`getStandings`. Useful for inspecting accumulated color history.

Mappings returned are in the form:

```javascript
[
  {
    'id': participant_id,
    'seed': participant_seed,
    'points': accumulated_points,
    'opponents': [ opponent_id, ... ],
    'colorsPlayed': [ 'home' | 'away', ... ]
  },
  ...
]
```

`colorsPlayed` is ordered chronologically — the first entry is the side played
in the earliest recorded match, and the last entry is the most recent. Color
tracking is reliable only for tournaments that were started (and whose match
history was recorded) with this version of the library or later; earlier match
records used `home` to indicate the higher-ranked participant rather than the
white-pieces holder.

### `participants` argument

The participants argument expects an array in the form:

```javascript
[
  {
    'id': participant_id,
    'seed': participant_seed,
    'droppedOut': has_dropped_out  // optional, default false
  }
]
```

* `participant_id` may be any value that exposes a toString method (and can
therefore be used as a key on a javascript object)
* `participant_seed` may be any directly sortable unique value, although numeric values (1..N)
are suggested for reliability
* `droppedOut` participants are excluded from matchmaking but are retained in
  the participants list so that their prior match records can be used for
  standings and color-history calculations

### `matches` argument

The matches argument expects an array in the form:

```javascript
[
  {
    'round': match_round,
    'home': {
      'id': home_participant_id,
      'points': home_won_points
    },
    'away': {
      'id': away_participant_id,
      'points': away_won_points
    }
  }
]
```

* `match_round` must be a value sortable against the given `currentRound`
argument - all `matches` will be limited to those where the `round` is less than
the `currentRound`
* `home_participant_id` and `away_participant_id` may be any values that
javascript is capable of using as an object key and **must** exist in the given
`teams` argument
* `home_points_won` and `away_points_won` *should* be numeric values, but
currently can be anything that can be accumulated against `0 + ...` and compared
against numeric values - there are also no checks against whether or not these
values overrun `maxPerRound` and any data that does overrun `maxPerRound` will
likely result in strange or erroneous results from every function in this
library

## Contributors
* [@dambrisco](https://github.com/dambrisco)
* [@philkjacobs](https://github.com/philkjacobs)
* [@kabobrocks](https://github.com/kabobrocks)
