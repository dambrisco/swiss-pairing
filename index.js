var blossom = require('edmonds-blossom')

// Doesn't account for forfeits yet, still debating on that implementation
// for multi-point scenarios
function getModifiedMedianScores(options, round, participants, matches) {
  matches = matches.filter(match => match.round < round)
  var mappings = getMappings(participants, matches)
  var points = mappings.reduce((acc, val) => {
    acc[val.id] = val.points
    return acc
  }, {})
  var scores = mappings.reduce((acc, history) => {
    history.opponents.forEach(opponent => {
      // Don't calculate points for null (BYE) opponents
      if (opponent) {
        acc[opponent].scores.push(history.points)
        acc[opponent].points += history.points
      }
    })
    return acc
  }, participants.reduce((acc, participant) => {
    acc[participant.id] = {
      scores: [],
      points: 0
    }
    return acc
  }, {}))
  var fifty = ((round - 1) * options.maxPerRound) / 2
  return Object.entries(scores).reduce((acc, [key, value]) => {
    value.scores.sort((a, b) => a - b)
    if (points[key] > fifty) {
      value.scores.shift()
    } else if (points[key] < fifty) {
      value.scores.pop()
    }
    acc[key] = value.scores.reduce((acc, val) => acc + val, 0)
    return acc
  }, {})
}

function getStandings(options, round, participants, matches) {
  matches = matches.filter(match => match.round < round)
  var scores = getModifiedMedianScores(
    options,
    round,
    participants,
    matches)
  var standings = participants.reduce((standings, participant) => {
    standings[participant.id] = {
      seed: participant.seed,
      wins: 0,
      losses: 0,
      tiebreaker: scores[participant.id]
    }
    return standings
  }, {})
  matches.forEach(match => {
    standings[match.home.id].wins += match.home.points
    standings[match.home.id].losses += match.away.points
    // Ignore null opponents/BYEs
    if (match.away.id) {
      standings[match.away.id].wins += match.away.points
      standings[match.away.id].losses += match.home.points
    }
  })
  return Object.entries(standings).reduce((standings, [key, value]) => {
    standings.push({
      id: key,
      seed: value.seed,
      wins: value.wins,
      losses: value.losses,
      tiebreaker: value.tiebreaker
    })
    return standings
  }, []).sort((a, b) => {
    if (a.wins === b.wins) {
      // TODO: Consider adding an Elo option that can be used as an additional sortable value
      if (a.tiebreaker === b.tiebreaker) {
        return a.seed - b.seed
      } else {
        return b.tiebreaker - a.tiebreaker
      }
    } else {
      return b.wins - a.wins
    }
  })
}

function getMatchups(options, round, participants, matches) {
  matches = matches.filter(match => match.round < round)
  var mappings = getMappings(participants, matches)
  mappings = mappings.filter(m => !m.droppedOut)

  // because ids are strings but the blossom algorithm needs integers
  // we create maps from int-to-id then set the ids to integers
  var mapIds = new Map()
  var index = 0
  for (var m of mappings) {
    mapIds.set(index, m.id)
    m.id = index++
    var homesPlayed = m.colorsPlayed.filter(c => c === 'home').length
    var awaysPlayed = m.colorsPlayed.filter(c => c === 'away').length
    m.colorImbalance = homesPlayed - awaysPlayed
    m.lastTwoColors = m.colorsPlayed.slice(-2)
    m.colorDue = m.colorImbalance > 0 ? 'away' : m.colorImbalance < 0 ? 'home' : null
  }

  if(mappings.length % 2 === 1) {
    // we simulate the bye having played against every team with a bye
    // that way those teams will not get a bye again unless the matches are
    // ridiculously better if they have another
    // we also want it to bias toward giving byes to teams at the bottom
    // of the standings
    mappings.push({id: index,
      points: 0,
      seed: 0,
      tiebreaker: 0,
      opponents: mappings.filter(m => {
        return m.opponents.filter(o => o === null).length > 0
      }).map(m => mapIds.get(m.id))
    })
    mapIds.set(index, null)
  }
  // to avoid repeatedly matching the same team up or down repeatedly
  // we shuffle the inputs to the blossom algorithm to counteract
  // any ordering biases it may have
  mappings = shuffle(mappings, round, options.seedMultiplier)
  var colorConflict = (a, b) => {
    if (!a.colorDue || !b.colorDue) return 0
    return (a.colorDue === b.colorDue) ? 1 : 0
  }
  var arr = mappings.reduce((arr, team, i, orig) => {
    var opps = orig.slice(0, i).concat(orig.slice(i + 1))
    for (var opp of opps) {
      arr.push([
          team.id,
          opp.id,
          -1 * (Math.pow(team.points - opp.points, options.standingPower) +
            options.rematchWeight * team.opponents.reduce((n, o) => {
              return n + (o === mapIds.get(opp.id))
            }, 0) +
            options.colorWeight * colorConflict(team, opp))
      ])
    }
    return arr
  }, [])

  var results = blossom(arr, true)
  var matchups = []
  // Here we sort matchups by standings so that matchups and standings follow
  // roughly the same order - this doesn't impact funcitonality at all
  // Ordering this in the view layer should be possible, so let's move it there
  // pending review
  var standings = getStandings(options, round, participants, matches)
  var sortedKeys = [...mapIds.keys()].sort((a, b) => {
    // Float BYEs to the end
    if (mapIds.get(a) === null) {
      return 1
    } else if (mapIds.get(b) === null) {
      return -1
    }
    return standings.findIndex(s => s.id === mapIds.get(a)) -
      standings.findIndex(s => s.id === mapIds.get(b))
  })
  var mappingById = new Map(mappings.map(m => [m.id, m]))
  var assignColors = (iIdx, jIdx) => {
    // BYE: active participant is always home
    if (mapIds.get(jIdx) === null) return { home: mapIds.get(iIdx), away: null }
    var iMap = mappingById.get(iIdx)
    var jMap = mappingById.get(jIdx)
    // Hard constraint: if last two colors are identical the player must switch
    var iForced = iMap.lastTwoColors.length === 2 && iMap.lastTwoColors[0] === iMap.lastTwoColors[1]
      ? (iMap.lastTwoColors[0] === 'home' ? 'away' : 'home')
      : null
    var jForced = jMap.lastTwoColors.length === 2 && jMap.lastTwoColors[0] === jMap.lastTwoColors[1]
      ? (jMap.lastTwoColors[0] === 'home' ? 'away' : 'home')
      : null
    // If both forced to the same side, the player with larger |colorImbalance| wins
    if (iForced && jForced && iForced === jForced) {
      if (Math.abs(iMap.colorImbalance) >= Math.abs(jMap.colorImbalance)) {
        jForced = null
      } else {
        iForced = null
      }
    }
    if (iForced) return iForced === 'home'
      ? { home: mapIds.get(iIdx), away: mapIds.get(jIdx) }
      : { home: mapIds.get(jIdx), away: mapIds.get(iIdx) }
    if (jForced) return jForced === 'home'
      ? { home: mapIds.get(jIdx), away: mapIds.get(iIdx) }
      : { home: mapIds.get(iIdx), away: mapIds.get(jIdx) }
    // Soft preference: player due home gets home, player due away gets away
    if (iMap.colorDue === 'home') return { home: mapIds.get(iIdx), away: mapIds.get(jIdx) }
    if (iMap.colorDue === 'away') return { home: mapIds.get(jIdx), away: mapIds.get(iIdx) }
    if (jMap.colorDue === 'home') return { home: mapIds.get(jIdx), away: mapIds.get(iIdx) }
    if (jMap.colorDue === 'away') return { home: mapIds.get(iIdx), away: mapIds.get(jIdx) }
    // Tie-break: lower-ranked player (higher standings index) gets home
    var iRank = standings.findIndex(s => s.id === mapIds.get(iIdx))
    var jRank = standings.findIndex(s => s.id === mapIds.get(jIdx))
    return iRank > jRank
      ? { home: mapIds.get(iIdx), away: mapIds.get(jIdx) }
      : { home: mapIds.get(jIdx), away: mapIds.get(iIdx) }
  }
  for(var i of sortedKeys) {
    if(results[i] !== -1 && !matchups.some(
      r => r.home === mapIds.get(i) || r.away === mapIds.get(i))) {
      matchups.push(assignColors(i, results[i]))
    }
  }
  return matchups
}

function getMappings(participants, matches) {
  return participants.reduce((acc, participant) => {
    acc.push(matches.filter(match => {
      return match.home.id === participant.id ||
        match.away.id === participant.id
    }).reduce((acc, match) => {
      if (match.home.id === participant.id) {
        acc.points += match.home.points
        acc.opponents.push(match.away.id)
        acc.colorsPlayed.push('home')
      } else if (match.away.id === participant.id) {
        acc.points += match.away.points
        acc.opponents.push(match.home.id)
        acc.colorsPlayed.push('away')
      }
      return acc
    }, {
      id: participant.id,
      seed: participant.seed,
      droppedOut: participant.droppedOut,
      points: 0,
      opponents: [],
      colorsPlayed: []
    }))
    return acc
  }, [])
}

// Knuth shuffle from stack overflow
function shuffle(array, seed, multiplier) {
  var currentIndex = array.length

  // fast, seeded PRNG from stackoverflow
  var s = seed
  const random = () => {
    var x = (Math.abs((((s++ * multiplier) / Math.PI) % 4) - 2) - 1) * 10000
    return x - Math.floor(x)
  }

  while (0 !== currentIndex) {
    var randomIndex = Math.floor(random() * currentIndex--)
    var temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

module.exports = (options) => {
  options = options || {}
  options.maxPerRound = options.maxPerRound || 1
  options.rematchWeight = options.rematchWeight || 100
  options.standingPower = options.standingPower || 2
  options.seedMultiplier = options.seedMultiplier || 6781
  options.colorWeight = (options.colorWeight != null) ? options.colorWeight : 3

  return {
    getModifiedMedianScores: getModifiedMedianScores.bind(null, options),
    getStandings: getStandings.bind(null, options),
    getMatchups: getMatchups.bind(null, options),
    getMappings: getMappings,
  }
}
