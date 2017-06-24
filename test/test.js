var onePerRound = require('../index.js')({
  maxPerRound: 1
})
var twoPerRound = require('../index.js')({
  maxPerRound: 2
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
      home: { id: 2, points: 1 },
      away: { id: 1, points: 1 }
    },
    {
      round: 1,
      home: { id: 3, points: 0 },
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

var oddModifiedMedian = twoPerRound.getModifiedMedianScores(2, odd.participants, odd.matches)
var expectedOddModifiedMedian = { '1': 1, '2': 1, '3': 0 }
var evenModifiedMedian = onePerRound.getModifiedMedianScores(3, even.participants, even.matches)
var expectedEvenModifiedMedian = { 'ID 1': 1, 'ID 2': 3, 'ID 3': 1, 'ID 4': 1 }
var oddStandings = twoPerRound.getStandings(2, odd.participants, odd.matches)
var expectedOddStandings = [
  { id: '2', seed: 1050, wins: 1, losses: 1, tiebreaker: 1 },
  { id: '1', seed: 1000, wins: 1, losses: 1, tiebreaker: 1 },
  { id: '3', seed: 950, wins: 0, losses: 0, tiebreaker: 0 }
]
var evenStandings = onePerRound.getStandings(3, even.participants, even.matches)
var expectedEvenStandings = [
  { id: 'ID 3', seed: 950, wins: 2, losses: 0, tiebreaker: 1 },
  { id: 'ID 2', seed: 625, wins: 1, losses: 1, tiebreaker: 3 },
  { id: 'ID 1', seed: 700, wins: 1, losses: 1, tiebreaker: 1 },
  { id: 'ID 4', seed: 800, wins: 0, losses: 2, tiebreaker: 1 }
]
var oddMatchupsRound1 = twoPerRound.getMatchups(1, odd.participants, odd.matches)
var expectedOddMatchupsRound1 = [
  { home: '2', away: '1' },
  { home: '3', away: null }
]
var oddMatchupsRound2 = twoPerRound.getMatchups(2, odd.participants, odd.matches)
var expectedOddMatchupsRound2 = [
  { home: '2', away: '3' },
  { home: '1', away: null }
]
var evenMatchupsRound1 = onePerRound.getMatchups(1, even.participants, even.matches)
var expectedEvenMatchupsRound1 = [
  { home: 'ID 3', away: 'ID 4' },
  { home: 'ID 1', away: 'ID 2' }
]
var evenMatchupsRound2 = onePerRound.getMatchups(2, even.participants, even.matches)
var expectedEvenMatchupsRound2 = [
  { home: 'ID 3', away: 'ID 2' },
  { home: 'ID 4', away: 'ID 1' }
]
var evenMatchupsRound3 = onePerRound.getMatchups(3, even.participants, even.matches)
var expectedEvenMatchupsRound3 = [
  { home: 'ID 3', away: 'ID 1' },
  { home: 'ID 2', away: 'ID 4' }
]

if (JSON.stringify(oddModifiedMedian) !== JSON.stringify(expectedOddModifiedMedian)) {
  throw new Error('getModifiedMedian incorrect for odd data')
}

if (JSON.stringify(evenModifiedMedian) !== JSON.stringify(expectedEvenModifiedMedian)) {
  throw new Error('getModifiedMedian incorrect for even data')
}

if (JSON.stringify(oddStandings) !== JSON.stringify(expectedOddStandings)) {
  throw new Error('getStandings incorrect for odd data')
}

if (JSON.stringify(evenStandings) !== JSON.stringify(expectedEvenStandings)) {
  throw new Error('getStandings incorrect for even data')
}

if (JSON.stringify(oddMatchupsRound1) !== JSON.stringify(expectedOddMatchupsRound1)) {
  throw new Error('getMatchups incorrect for odd data')
}

if (JSON.stringify(oddMatchupsRound2) !== JSON.stringify(expectedOddMatchupsRound2)) {
  throw new Error('getMatchups incorrect for odd data')
}

if (JSON.stringify(evenMatchupsRound1) !== JSON.stringify(expectedEvenMatchupsRound1)) {
  throw new Error('getMatchups incorrect for even data')
}

if (JSON.stringify(evenMatchupsRound2) !== JSON.stringify(expectedEvenMatchupsRound2)) {
  throw new Error('getMatchups incorrect for even data')
}

if (JSON.stringify(evenMatchupsRound3) !== JSON.stringify(expectedEvenMatchupsRound3)) {
  throw new Error('getMatchups incorrect for even data')
}
