const Account = require('../models/accountmodel')
const notifyUsers = require('../lib/notifyUsers')
const _ = require('lodash')

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
const formatAction = require('../lib/formatAction')

const monitorAccounts = async () => {
  // console.log('monitor accounts...')

  // Get all accounts
  Account.find((err, accounts) => {
    if (err) return console.error(err)
    else {
      if (accounts && accounts.length > 0) {
        console.log('found ', accounts.length, ' to monitor')
        accounts.forEach(account => {
          // Check this account
          const lastActionSeq = account.last_action_seq
          let maxActionSeq = lastActionSeq
          console.log('check account...', account.account_name, ' last_action_req', lastActionSeq)

          // Fetch all actions from EOS blockchain for this account
          eos.getActions({account_name: account.account_name, pos: 0, offset: 0}, (error, result) => {
            if (error) return console.log(error)

            if (result.actions && result.actions.length > 0) {
              // Filter only actions newer than the last displayed ones
              const newActions = _.filter(result.actions, (a) => a.account_action_seq > lastActionSeq)

              // Sort actions by number
              const sortedActions = newActions.sort((a, b) => a.account_action_seq - b.account_action_seq)
              console.log('sorted new actions: ', sortedActions.length)
              sortedActions.forEach(action => {
                // Notify users about each new action
                console.log('new action: ', formatAction(action))
                notifyUsers(account, 'New action on account ' + account.account_name + ': \n' + formatAction(action))
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
        // console.log('there are no accounts to monitor')
      }
    }
  })
}

module.exports = monitorAccounts
