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

var oddModifiedMedian = twoPerRound.getModifiedMedianScores(2, odd.participants, odd.matches)
var evenModifiedMedian = onePerRound.getModifiedMedianScores(3, even.participants, even.matches)
var oddStandings = twoPerRound.getStandings(2, odd.participants, odd.matches)
var evenStandings = onePerRound.getStandings(3, even.participants, even.matches)
var oddMatchups = twoPerRound.getMatchups(2, odd.participants, odd.matches)
var evenMatchups = onePerRound.getMatchups(3, even.participants, even.matches)

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
