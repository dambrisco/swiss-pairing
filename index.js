// Doesn't account for forfeits yet, still debating on that implementation
// for multi-point scenarios
function getModifiedMedianScores(
  maxPerRound, currentRound, participants, matches) {
  matches = matches.filter(match => match.round < currentRound)
  var mappings = participants.reduce((acc, participant) => {
    acc.push(matches.filter(match => {
      return match.home.id === participant.id ||
        match.away.id === participant.id
    }).reduce((acc, match) => {
      if (match.home.id === participant.id) {
        acc.points += match.home.points
        acc.opponents.push(match.away.id)
      } else if (match.away.id === participant.id) {
        acc.points += match.away.points
        acc.opponents.push(match.home.id)
      }
      return acc
    }, { id: participant.id, points: 0, opponents: [] }))
    return acc
  }, [])
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
  var fifty = ((currentRound - 1) * maxPerRound) / 2
  return Object.entries(scores).reduce((acc, [key, value]) => {
    value.scores.sort()
    if (points[key] > fifty) {
      value.scores.shift()
    } else if (points[key] < fifty) {
      value.scores.pop()
    }
    acc[key] = value.scores.reduce((acc, val) => acc + val, 0)
    return acc
  }, {})
}

function getStandings(maxPerRound, currentRound, participants, matches) {
  matches = matches.filter(match => match.round < currentRound)
  var scores = getModifiedMedianScores(
    maxPerRound,
    currentRound,
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
      if (a.tiebreaker === b.tiebreaker) {
        return b.seed - a.seed
      } else {
        return b.tiebreaker - a.tiebreaker
      }
    } else {
      return b.wins - a.wins
    }
  })
}

function getMatchups(maxPerRound, currentRound, participants, matches) {
  matches = matches.filter(match => match.round < currentRound)
  var standings = getStandings(maxPerRound, currentRound, participants, matches)
  standings.sort((a, b) => {
    if (a.wins === b.wins) {
      if (a.tiebreaker === b.tiebreaker) {
        return b.seed - a.seed
      } else {
        return b.tiebreaker - a.tiebreaker
      }
    } else {
      return b.wins - a.wins
    }
  })
  var exclusions = participants.reduce((exclusions, participant) => {
    if (!exclusions.hasOwnProperty(participant.id)) {
      exclusions[participant.id] = [participant.id.toString()]
    }
    return exclusions
  }, {})

  exclusions = matches.reduce((exclusions, match) => {
    if (exclusions[match.home.id] &&
      !exclusions[match.home.id]
      .includes(match.away.id)) {
      if (match.away.id !== null) {
        exclusions[match.home.id].push(match.away.id.toString())
      }
    }
    if (exclusions[match.away.id] &&
      !exclusions[match.away.id]
      .includes(match.home.id)) {
      exclusions[match.away.id].push(match.home.id.toString())
    }
    return exclusions
  }, exclusions)

  var orderedParticipants = standings.map(s => {
    return s.id
  })
  // Add BYE to the end of the list
  orderedParticipants.push(null)
  var matchups = standings.reduce((matchups, standing) => {
    // Don't match any participants that are already matched
    var matched = matchups.filter(matchup => {
      return matchup.home === standing.id ||
        matchup.away === standing.id
    }).length > 0
    if (matched) {
      return matchups
    }

    var opponent = orderedParticipants.filter(id => {
      return !exclusions[standing.id].includes(id) &&
        matchups.filter(matchup => {
          return matchup.home === id ||
            matchup.away === id
        }).length === 0
    }).shift()
    // Highest seed is always the home participant for now
    matchups.push({
      home: standing.id,
      away: opponent
    })
    return matchups
  }, [])
  return matchups
}

module.exports = (options) => {
  if (!options) {
    options = {}
  }
  if (!options.maxPerRound) {
    options.maxPerRound = 1
  }
  return {
    getModifiedMedianScores: getModifiedMedianScores.bind(
      null, options.maxPerRound),
    getStandings: getStandings.bind(null, options.maxPerRound),
    getMatchups: getMatchups.bind(null, options.maxPerRound)
  }
}
