require('dotenv').config()
const dateFormat = require('dateformat')
const formatAction = require('./lib/formatAction')
const msg = require('./messages')
const producerSearch = require('./lib/producerSearch')
const formatProducersList = require('./lib/formatProducersList')
const _ = require('lodash')

const niceDate = (x) => dateFormat(Date.parse(x), '🗓 *ddd, mmm dS, yyyy, 🕐 h:MM:ss*')

// Connect to MongoDB
const mongoose = require('mongoose')
const Account = require('./models/accountmodel')
mongoose.connect(process.env.MONGOLAB_URI)

const db = mongoose.connection
mongoose.Promise = global.Promise
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', function () {
  console.log('MongoDB connected')
})

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

// Connect Telegram Bot
const { Composer, log, session, Markup } = require('micro-bot')
const app = new Composer()

app.use(log())
app.use(session())

app.command('start', (ctx) =>
  ctx.replyWithMarkdown(msg.start, Markup
    .keyboard([['/info', '/help']])
    .resize()
    .extra()
  )
)

app.command('info', (ctx) => {
  eos.getInfo((error, result) => {
    console.log(error, JSON.stringify(result, null, 2))
    const info = 'chainId: ' + result.chain_id + '\n' +
    '*' + niceDate(result.head_block_time) + '*\n' +
    '🗳 block #*' + result.head_block_num + '* lib: *' + result.last_irreversible_block_num + '*\n 💼 producer: *' +
    result.head_block_producer + '*'

    ctx.replyWithMarkdown(info)

    eos.getProducers({json: true, limit: 500}, (error, result) => {
      if (error) return console.log(error)
      if (result && result.rows && result.rows.length > 0) {
        ctx.replyWithMarkdown('*Top 21 producers: *\n' + formatProducersList(result.rows, 21))
      } else {
        ctx.replyWithMarkdown('There are no producers')
      }
    })
  })
})

app.command('block', (ctx) => {
  const {text} = ctx.message
  const index = text.trim().indexOf(' ')
  const query = index > 0 ? text.substr(index + 1) : ''

  eos.getBlock({block_num_or_id: query}, (error, result) => {
    if (error) return console.log(error)
    console.log(result)
    let reply = '🗳 block #*' + query + '* \n' + niceDate(result.timestamp) +
    '*\n' + '💼 producer: *' + result.producer + '\n\n' +
    'Transactions (account, name, memo):\n'
    for (var i = 0; i < result.transactions.length; i++) {
      for (var k = 0; k < result.transactions[i].trx.transaction.actions.length; k++) {
        const memo = result.transactions[i].trx.transaction.actions[k].data.memo || ''
        reply += '*' + result.transactions[i].trx.transaction.actions[k].account + '*, ' + result.transactions[i].trx.transaction.actions[k].name + ', \'' + memo + '\'\n'
      }
    }
    ctx.replyWithMarkdown(reply)
    console.log(error, reply)
  })
})

app.command('account', (ctx) => {
  const {text} = ctx.message
  const index = text.trim().indexOf(' ')
  const query = index > 0 ? text.substr(index + 1) : ''

  eos.getAccount({'account_name': query}, (error, result) => {
    if (error) return console.log(error)
    console.log(result)
    let text = '🗂 *' + result.account_name + '*\n' +
      'created: ' + niceDate(result.created) + '\n' +
      'last code update: ' + niceDate(result.last_code_update) + '\n'
    text += result.core_liquid_balance ? 'balance: *' + result.core_liquid_balance + '*\n' : ''
    if (result.total_resources) {
      text += result.total_resources.cpu_weight ? 'cpu weight: ' + result.total_resources.cpu_weight + '\n' : ''
      text += result.total_resources.net_weight ? 'net weight: ' + result.total_resources.net_weight + '\n' : ''
      text += result.total_resources.ram_bytes ? 'ram bytes: ' + result.total_resources.ram_bytes + '\n' : ''
    }
    text += result.voter_info && result.voter_info.last_vote_weight ? 'last vote weight: ' + result.voter_info.last_vote_weight : ''
    ctx.replyWithMarkdown(text)

    // Fetch all assets for this account
    eos.getCurrencyBalance({code: 'eosio.token', account_name: query, symbol: 'SYS'}, (error, result) => {
      if (error) return console.log(error)
      console.log('assets: ', result)

      if (result.actions && result.actions.length > 0) {
        // Sort actions by number
        ctx.replyWithMarkdown('*Assets:*')
        result.asset.forEach(asset => ctx.reply(asset))
      }
    })

    // Fetch all actions for this account
    eos.getActions({account_name: query, pos: 0, offset: 0}, (error, result) => {
      if (error) return console.log(error)

      if (result.actions && result.actions.length > 0) {
        // Sort actions by number
        const actions = result.actions.sort((a, b) => a.account_action_seq - b.account_action_seq)
        console.log('actions: ', actions)
        ctx.replyWithMarkdown('*Transactions:*')
        actions.forEach((action) => {
          const text = formatAction(action)
          console.log(text)
          ctx.replyWithHTML(text, {disable_web_page_preview: true})
        })
      }
    })
  })
})

app.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
  const offset = parseInt(inlineQuery.offset) || 0
  const query = inlineQuery.query || ''
  if (query.length >= 1) {
    const result = await producerSearch(query, offset)
    console.log(result.length, ' producers: ', result)
    return answerInlineQuery(result, { next_offset: offset + result.length })
  }
})

app.command('help', ctx => ctx.replyWithMarkdown(msg.help))

// Add account to the monitoring list
app.command('watch_account', ctx => {
  const {text} = ctx.message
  const index = text.trim().indexOf(' ')
  const query = index > 0 ? text.substr(index + 1) : ''

  if (query.length > 0) {
    // check if the account exists
    console.log('find account ' + query)
    Account.findOne({account_name: query}, (err, acc) => {
      if (err) return console.log(err)
      if (!acc) {
        // account not found
        console.log('account ', query, ' not found, adding it...')
        var newAcc = new Account({ account_name: query, users: [{chat: ctx.chat, from: ctx.from}] })
        newAcc.save(function (err, acc) {
          if (err) return console.error(err)
          console.log('added new account: ', acc)
          ctx.replyWithMarkdown('you will be notified when there will be new actions on account ' + query)
        })
      } else {
        console.log('found account ', acc, 'adding user to watchers')
        if (!_.find(acc.users, u => u.from.id === ctx.from.id)) {
          // user is not in the list
          acc.users = acc.users.concat([{chat: ctx.chat, from: ctx.from}])
          acc.save(function (err, acc) {
            if (err) return console.error(err)
            console.log('added new user to account: ', acc)
            ctx.replyWithMarkdown('*Done*. You will be notified when there will be new actions on account ' + query)
          })
        } else {
          // user already in the list
          ctx.replyWithMarkdown('*Done*. you are already subscribed for notifications for this account ')
        }
      }
    })
  }
})

app.command('stop', ctx => {
  console.log('stop all subscriptions for this account ', ctx.message.from.id)
  const query = JSON.parse('{ "users": {"from.id": ' + ctx.message.from.id + '}}')
  console.log('query: ', query)
  Account.deleteMany({}, (error) => {
    if (error) return console.log(error)
    console.log('all accounts deleted...')
    ctx.reply('Done. All subscriptions deleted')
  })
})

// List all producers
app.command('producers', ctx => {
  eos.getProducers({json: true, limit: 100}, (error, result) => {
    if (error) return console.log(error)
    if (result && result.rows && result.rows.length > 0) {
      ctx.reply(formatProducersList(result.rows))
    } else {
      ctx.replyWithMarkdown('There are no producers')
    }
  })
})

// launch account monitoring
const monitorAccounts = require('./lib/monitorAccounts')
// setInterval(monitorAccounts, 2000)

const dailyTop21 = require('./lib/dailyTop21')
dailyTop21()

module.exports = app
