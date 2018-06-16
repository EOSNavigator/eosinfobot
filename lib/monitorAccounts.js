const Account = require('../models/accountmodel')

// Connect to EOS
const Eos = require('eosjs')
const config = {
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  httpEndpoint: 'https://eos.greymass.com',
  expireInSeconds: 60,
  broadcast: true,
  debug: false,
  sign: true
}

const eos = Eos(config)
const formatAction = require('../lib/formatAction')

const monitorAccounts = async () => {
  console.log('monitor accounts...')
  // Get all accounts
  Account.find((err, accounts) => {
    if (err) return console.error(err)
    else {
      if (accounts && accounts.length > 0) {
        console.log('found ', accounts.length, ' to monitor')
        accounts.forEach(account => {
          console.log('check account...', account.account_name)
          eos.getActions({account_name: account.account_name, pos: 0, offset: 0}, (error, result) => {
            if (error) return console.log(error)
            // console.log('account ', account.account_name, ' actions: ' + formatAction(result))
            if (result.actions && result.actions.length > 0) {
              const lastActionSeq = account.last_action_seq ? account.last_action_seq : -1
              const newActions = result.actions.filter(action => action.account_action_seq > lastActionSeq)
              let maxActionSeq = lastActionSeq
              const sortedActions = newActions.sort(a => a.account_action_seq)
              console.log('sorted new actions: ', JSON.stringify(sortedActions))
              sortedActions.forEach(action => {
                console.log('new action: ', formatAction(action))
                maxActionSeq = Math.max(maxActionSeq, action.account_action_seq)
              })

              // Update last max action seq
              account.last_action_seq = maxActionSeq
              account.save((err, res) => {
                if (err) return console.log(error)
                console.log('updated account ', res.account_name, ' new seq: ', res.last_action_seq)
              })
            } else console.log('there are no actions for ', account.account_name)                
          })
        })
      } else {
        console.log('there are no accounts to monitor')
      }
    }
  })
}

module.exports = monitorAccounts
