# swiss-pairing
[![NPM version](https://img.shields.io/npm/v/swiss-pairing.svg)](https://npmjs.org/package/swiss-pairing "View this project on NPM")
[![Build Status](https://img.shields.io/travis/dambrisco/swiss-pairing.svg)](https://travis-ci.org/dambrisco/swiss-pairing "View this project's build information")
[![Dependency Status](https://img.shields.io/david/dambrisco/swiss-pairing.svg)](https://david-dm.org/dambrisco/swiss-pairing "Check this project's dependencies")

swiss-pairing is a tiny swiss pairing library with basic deterministic functionality

## Installation

* `npm install --save swiss-pairing`
* `require('swiss-pairing')(options)`
  * `options` contains configurable variables, currently only
  `maxPointsPerRound` (usually 1, sometimes 2)
  * See `test/test.js` for usage example

## Usage

**Caveat**: This library is designed for once-through scenarios. If you want to have participants
paired multiple times, you'll need to trim the match history passed to the
methods as appropriate for your scenario.

swiss-pairing exposes the following three methods:

### getMatchups(round, participants, matches)

See `participants` and `matches` formats below.

Determines the matchups for the given round by pairing participants:

* who have **not** faced each other
* in order of:
  * highest standing to lowest
  * highest modified median score to lowest
  * highest seed to lowest
* where the highest ranked team in a pair is given the `home` side

When byes are needed (in the case of an odd number of participants), they bubble
up from the lowest to the highest ranking, (starting with the lowest seed when
no match history is available). participants cannot have more than one bye.

Matchups returned are in the form:

```json
[
  {
    home: home_participant_id,
    away: away_participant_id
  },
  ...
]
```

### getStandings(round, participants, matches)

See `participants` and `matches` formats below.

Determines the standings for a given round by accumulating won points and lost
points and calculating modified median scores. Standings are ordered by wins,
modified median score, and seed in that order.

Standings returned are in the form:

```json
[
  {
    id: participant_id,
    seed: seed,
    wins: won_points,
    losses: lost_points,
    tiebreaker: modified_median_score
  },
  ...
]
```

### getModifiedMedianScores(round, participants, matches)

See `participants` and `matches` formats below.

Caculates modified median scores based on the given participants and paired
match history.

Scores returned are in the form:

```json
{
  <participant_id>: modified_median_score,
  ...
}
```

### `participants` argument

The participants argument expects an array in the form:

```json
[
  {
    id: participant_id,
    seed: participant_seed
  }
]
```

* `participant_id` may be any value that exposes a toString method (and can
therefore be used as a key on a javascript object)
* `participant_seed` may be any directly sortable value, although numeric values
are suggested for reliability

### `matches` argument

The matches argument expects an array in the form:

```json
[
  {
    round: match_round,
    home: {
      id: home_participant_id,
      points: home_won_points
    },
    home: {
      id: away_participant_id,
      points: away_won_points
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
