var onePerRound = require('../index.js')({
  maxPerRound: 1
})
var twoPerRound = require('../index.js')({
  maxPerRound: 2
})
var zeroColorWeight = require('../index.js')({
  maxPerRound: 1,
  colorWeight: 0
})

var odd = {
  participants: [
    { id: 1, seed: 1000 },
    { id: 2, seed: 1050 },
    { id: 3, seed: 950 }
  ],
  matches: [
    {
      round: 1,
      home: { id: 1, points: 1 },
      away: { id: 3, points: 1 }
    },
    {
      round: 1,
      home: { id: 2, points: 0 },
      away: { id: null, points: 0 }
    }
  ]
}

var even = {
  participants: [
    { id: 'ID 1', seed: 700 },
    { id: 'ID 2', seed: 625 },
    { id: 'ID 3', seed: 950 },
    { id: 'ID 4', seed: 800 }
  ],
  matches: [
    {
      round: 1,
      home: { id: 'ID 3', points: 1 },
      away: { id: 'ID 4', points: 0 }
    },
    {
      round: 1,
      home: { id: 'ID 1', points: 0 },
      away: { id: 'ID 2', points: 1 }
    },
    {
      round: 2,
      home: { id: 'ID 3', points: 1 },
      away: { id: 'ID 2', points: 0 }
    },
    {
      round: 2,
      home: { id: 'ID 4', points: 0 },
      away: { id: 'ID 1', points: 1 }
    },
  ]
}

var byeTest = {
  participants: [
    { id: 'Team 1',
      seed: 3636,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 2',
      seed: 4001,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 3',
      seed: 4001,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 4',
      seed: 4011,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 5',
      seed: 4029,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 6',
      seed: 4030,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 7',
      seed: 4043,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 8',
      seed: 4044,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 9',
      seed: 4066,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 10',
      seed: 4142,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 11',
      seed: 4174,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 12',
      seed: 4179,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 13',
      seed: 4183,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 14',
      seed: 4194,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 15',
      seed: 4199,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 16',
      seed: 4209,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 17',
      seed: 4233,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 18',
      seed: 4270,
      disbanded: false,
      droppedOut: false },
    { id: 'Team 19',
      seed: 4362,
      disbanded: false,
      droppedOut: false }
  ],
  matches: [
    { round: 1,
      home: { id: 'Team 19', points: 1 },
      away: { id: 'Team 17', points: 1 } },
    { round: 1,
      home: { id: 'Team 18', points: 0 },
      away: { id: 'Team 14', points: 2 } },
    { round: 1,
      home: { id: 'Team 15', points: 1 },
      away: { id: 'Team 13', points: 1 } },
    { round: 1,
      home: { id: 'Team 11', points: 1 },
      away: { id: 'Team 10', points: 1 } },
    { round: 1,
      home: { id: 'Team 16', points: 1 },
      away: { id: 'Team 7', points: 1 } },
    { round: 1,
      home: { id: 'Team 9', points: 1 },
      away: { id: 'Team 4', points: 1 } },
    { round: 1,
      home: { id: 'Team 8', points: 2 },
      away: { id: 'Team 6', points: 0 } },
    { round: 1,
      home: { id: 'Team 2', points: 0 },
      away: { id: 'Team 3', points: 2 } },
    { round: 1,
      home: { id: 'Team 5', points: 1 },
      away: { id: 'Team 1', points: 1 } },
    { round: 1,
      home: { id: 'Team 12', points: 2 },
      away: { id: null, points: 0 } },
    { round: 2,
      home: { id: 'Team 7', points: 2 },
      away: { id: 'Team 19', points: 0 } },
    { round: 2,
      home: { id: 'Team 10', points: 1 },
      away: { id: 'Team 17', points: 1 } },
    { round: 2,
      home: { id: 'Team 11', points: 2 },
      away: { id: 'Team 15', points: 0 } },
    { round: 2,
      home: { id: 'Team 9', points: 1 },
      away: { id: 'Team 18', points: 1 } },
    { round: 2,
      home: { id: 'Team 14', points: 2 },
      away: { id: 'Team 8', points: 0 } },
    { round: 2,
      home: { id: 'Team 16', points: 0 },
      away: { id: 'Team 4', points: 2 } },
    { round: 2,
      home: { id: 'Team 6', points: 1 },
      away: { id: 'Team 12', points: 1 } },
    { round: 2,
      home: { id: 'Team 3', points: 1 },
      away: { id: 'Team 5', points: 1 } },
    { round: 2,
      home: { id: 'Team 13', points: 2 },
      away: { id: 'Team 1', points: 0 } },
    { round: 2,
      home: { id: 'Team 2', points: 2 },
      away: { id: null, points: 0 } }
  ]
}

// Hard constraint: HC 1 has played home twice in a row → must be away in R3
var hardConstraintTest = {
  participants: [
    { id: 'HC 1', seed: 1000 },
    { id: 'HC 2', seed: 900 }
  ],
  matches: [
    { round: 1, home: { id: 'HC 1', points: 1 }, away: { id: 'HC 2', points: 0 } },
    { round: 2, home: { id: 'HC 1', points: 1 }, away: { id: 'HC 2', points: 0 } }
  ]
}

// Soft balance: SB A played home, SB B played away (in rounds against other opponents)
//   → SB A is due away, SB B is due home; their first meeting should reflect this
//   OTHER 1 and OTHER 2 are droppedOut so they are excluded from matchmaking but
//   remain in the participants list so getModifiedMedianScores can look them up
var softBalanceTest = {
  participants: [
    { id: 'SB A',    seed: 1000 },
    { id: 'SB B',    seed: 900 },
    { id: 'OTHER 1', seed: 800, droppedOut: true },
    { id: 'OTHER 2', seed: 700, droppedOut: true }
  ],
  matches: [
    { round: 1, home: { id: 'SB A',    points: 1 }, away: { id: 'OTHER 1', points: 0 } },
    { round: 1, home: { id: 'OTHER 2', points: 1 }, away: { id: 'SB B',    points: 0 } }
  ]
}

// colorWeight: 0 regression — with no color weight, score proximity dominates
//   CW 1 & CW 2 both have 1 pt (colorDue='away'); CW 3 & CW 4 both have 0 pts (colorDue='home')
//   colorWeight=0 → score-based pairing wins: CW1 vs CW2, CW3 vs CW4
//   colorWeight=3 → color compatibility wins: cross-score pairings
var colorWeightTest = {
  participants: [
    { id: 'CW 1', seed: 1000 },
    { id: 'CW 2', seed: 900 },
    { id: 'CW 3', seed: 800 },
    { id: 'CW 4', seed: 700 }
  ],
  matches: [
    { round: 1, home: { id: 'CW 1', points: 1 }, away: { id: 'CW 3', points: 0 } },
    { round: 1, home: { id: 'CW 2', points: 1 }, away: { id: 'CW 4', points: 0 } }
  ]
}

var oddModifiedMedian = twoPerRound.getModifiedMedianScores(2, odd.participants, odd.matches)
var evenModifiedMedian = onePerRound.getModifiedMedianScores(3, even.participants, even.matches)
var oddStandings = twoPerRound.getStandings(2, odd.participants, odd.matches)
var evenStandings = onePerRound.getStandings(3, even.participants, even.matches)
var oddMatchups = twoPerRound.getMatchups(2, odd.participants, odd.matches)
var evenMatchups = onePerRound.getMatchups(3, even.participants, even.matches)

var byeMatchups = twoPerRound.getMatchups(3, byeTest.participants, byeTest.matches)
console.log(byeMatchups)

if (Object.entries(oddModifiedMedian).length !== 3) {
  throw new Error('getModifiedMedian incorrect for odd data')
}

if (Object.entries(evenModifiedMedian).length !== 4) {
  throw new Error('getModifiedMedian incorrect for even data')
}

if (oddStandings.length !== 3) {
  throw new Error('getStandings incorrect for odd data')
}

if (evenStandings.length !== 4) {
  throw new Error('getStandings incorrect for even data')
}

if (oddMatchups.length !== 2) {
  throw new Error('getStandings incorrect for odd data')
}

if (evenMatchups.length !== 2) {
  throw new Error('getStandings incorrect for even data')
}

var evenMappings = onePerRound.getMappings(even.participants, even.matches)
var expectedColorsPlayed = {
  'ID 1': ['home', 'away'],
  'ID 2': ['away', 'away'],
  'ID 3': ['home', 'home'],
  'ID 4': ['away', 'home']
}
evenMappings.forEach(mapping => {
  var expected = expectedColorsPlayed[mapping.id]
  if (!expected) {
    throw new Error('getMappings returned unexpected participant id: ' + mapping.id)
  }
  if (mapping.colorsPlayed.length !== expected.length ||
      !mapping.colorsPlayed.every((color, i) => color === expected[i])) {
    throw new Error('getMappings colorsPlayed incorrect for ' + mapping.id +
      ': expected ' + JSON.stringify(expected) +
      ', got ' + JSON.stringify(mapping.colorsPlayed))
  }
})

// Test 1: Hard color constraint — player forced away after two consecutive home assignments
var hcMatchups = onePerRound.getMatchups(3, hardConstraintTest.participants, hardConstraintTest.matches)
if (hcMatchups.length !== 1) {
  throw new Error('hardConstraint: expected 1 matchup, got ' + hcMatchups.length)
}
if (hcMatchups[0].away !== 'HC 1' || hcMatchups[0].home !== 'HC 2') {
  throw new Error('hardConstraint: HC 1 (home×2) must be away, HC 2 must be home; got: ' +
    JSON.stringify(hcMatchups[0]))
}

// Test 2: Soft color balance — player due away is assigned away, player due home is assigned home
var sbMatchups = onePerRound.getMatchups(2, softBalanceTest.participants, softBalanceTest.matches)
if (sbMatchups.length !== 1) {
  throw new Error('softBalance: expected 1 matchup, got ' + sbMatchups.length)
}
if (sbMatchups[0].home !== 'SB B' || sbMatchups[0].away !== 'SB A') {
  throw new Error('softBalance: SB B (colorDue: home) should be home, SB A (colorDue: away) should be away; got: ' +
    JSON.stringify(sbMatchups[0]))
}

// Test 3: colorWeight: 0 — score proximity governs pairings when color weight is disabled
//   With colorWeight=0: score-based optimal is CW1 vs CW2 (both 1pt) and CW3 vs CW4 (both 0pt)
//   With colorWeight=3 (default): color-compatible pairings win despite the score mismatch
var zeroWeightMatchups = zeroColorWeight.getMatchups(2, colorWeightTest.participants, colorWeightTest.matches)
var zwPairs = zeroWeightMatchups.map(function(m) { return [m.home, m.away].sort().join('|') })
if (zwPairs.indexOf('CW 1|CW 2') === -1) {
  throw new Error('colorWeight:0 should pair CW 1 vs CW 2 (score-based); got: ' +
    JSON.stringify(zeroWeightMatchups))
}
if (zwPairs.indexOf('CW 3|CW 4') === -1) {
  throw new Error('colorWeight:0 should pair CW 3 vs CW 4 (score-based); got: ' +
    JSON.stringify(zeroWeightMatchups))
}
// With default colorWeight the color-compatible cross-score pairings should differ
var defaultWeightMatchups = onePerRound.getMatchups(2, colorWeightTest.participants, colorWeightTest.matches)
var dwPairs = defaultWeightMatchups.map(function(m) { return [m.home, m.away].sort().join('|') })
if (dwPairs.indexOf('CW 1|CW 2') !== -1 || dwPairs.indexOf('CW 3|CW 4') !== -1) {
  throw new Error('default colorWeight should produce cross-score color-compatible pairings; got: ' +
    JSON.stringify(defaultWeightMatchups))
}

// Test 4: BYE matchups have away: null
if (!byeMatchups.some(m => m.away === null)) {
  throw new Error('BYE matchup should have away: null; got: ' + JSON.stringify(byeMatchups))
}
