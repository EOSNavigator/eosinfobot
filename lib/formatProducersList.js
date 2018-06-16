const beautify = require("json-beautify")

function prettyNumber (num) {
  num = parseInt(parseInt(num) / 1e10 * 2.8);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const formatProducersList = (producers) => {
  // create a new list of producers
  let producersList = []
  let votesSum = 0
  let rankNumber = 1
  producers.forEach(p => {
    let producer = {
      owner: p.owner,
      votes: p.total_votes,
      votes_string: p.total_votes,
      rank: rankNumber++
    }
    votesSum += p.total_votes
    // console.log('producer: ' + beautify(producer, null, 2, 100))
    producersList.push(producer)
  })

  const sortedProducers = producersList.sort((a, b) => b.votes - a.votes).slice(0, 100)
  let msg = ''
  sortedProducers.forEach(p => {
    p.share = p.votes / votesSum
    msg += `${p.rank}. *${p.owner}*   ${prettyNumber(p.votes)} \n`
  })

  console.log('sorted: ' + beautify(sortedProducers, null, 2, 100))
  return msg
}

module.exports = formatProducersList
