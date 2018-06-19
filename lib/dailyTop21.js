const Account = require('../models/accountmodel')
const notifyUsers = require('../lib/notifyUsers')
const _ = require('lodash')

function prettyNumber (num) {
  num = parseInt(parseInt(num) / 1e10 * 2.8);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Connect to EOS
const Eos = require('eosjs')
const config = {
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  httpEndpoint: 'https://api.eosnewyork.io',
  expireInSeconds: 60,
  broadcast: true,
  debug: false,
  sign: true
}

const eos = Eos(config)

const dailyTop21 = async () => {
  console.log('create new daily top 21 chart...')

  eos.getProducers({json: true, limit: 500}, (error, result) => {
    if (error) return console.log(error)
    if (result && result.rows && result.rows.length <= 0) return console.log('there were no producers in the list')

    // sort the list
    const producersList = result.rows.sort((a, b) => b.total_votes - a.total_votes).slice(0, 21)
    // console.log('raw producers list: ', result.rows)
    // console.log('sorted producers list: ', producersList)
    let rank = 1
    const text = producersList.reduce((msg, p) => msg + (rank++).toString() + '  ' + p.owner + '  ' + prettyNumber(p.total_votes) + '\n', '')
    console.log('message: ' + text)
  })
}

module.exports = dailyTop21
