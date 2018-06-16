const beautify = require("json-beautify")

const formatProducersList = (producers) => {
  // create a new list of producers
  let producersList = []
  let votesSum = 0
  let rankNumber = 1
  producers.forEach(p => {
    let producer = {
      owner: p.owner,
      votes: Number.parseFloat(p.total_votes),
      votes_string: p.total_votes,
      rank: rankNumber++
    }
    votesSum += Number.parseFloat(p.total_votes)
    // console.log('producer: ' + beautify(producer, null, 2, 100))
    producersList.push(producer)
  })

  const sortedProducers = producersList.sort((a, b) => b.votes - a.votes).slice(0, 21)
  sortedProducers.forEach(p => {
    p.share = p.votes / votesSum
  })

  console.log('sorted: ' + beautify(sortedProducers, null, 2, 100))
  return beautify(sortedProducers, null, 2, 100)
}

module.exports = formatProducersList
