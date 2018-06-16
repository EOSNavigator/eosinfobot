require('dotenv').config()
const msg = require('./messages')
const producerSearch = require('./lib/producerSearch')
const formatProducer = require('./lib/formatProducer')
const _ = require('lodash')

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
  httpEndpoint: 'https://eos.greymass.com',
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
    .keyboard([['info', 'help']])
    .resize()
    .extra()
  )
)

app.command('info', (ctx) =>
  eos.getInfo((error, result) => {
    ctx.reply(`info: ${JSON.stringify(result)}`)
    console.log(error, JSON.stringify(result))
  })
)

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
            ctx.replyWithMarkdown('you will be notified when there will be new actions on account ' + query)
          })
        } else {
          // user already in the list
          ctx.replyWithMarkdown('you are already subscribed for notifications for this account ')
        }
      }
    })
  }
})

// List all accounts
app.command('producers', ctx => {
  eos.getProducers({json: true, limit: 21}, (error, result) => {
    if (error) return console.log(error)
    if (result && result.rows && result.rows.length > 0) {
      result.rows.forEach(producer => {
        ctx.replyWithMarkdown(formatProducer(producer))
      })
    } else {
      ctx.replyWithMarkdown('There are no producers')
    }
  })
})

// // List all accounts
// app.command('list', ctx => {
//   Account.find((err, accounts) => {
//     if (err) return console.error(err)
//     else {
//       if (accounts && accounts.length > 0) {
//         console.log('found accounts: ', accounts)
//         ctx.replyWithMarkdown(JSON.stringify(accounts))
//       } else {
//         console.log('there are no accounts to monitor')
//         ctx.replyWithMarkdown('there are no accounts to monitor')
//       }
//     }
//   })
// })

// launch account monitoring
const monitorAccounts = require('./lib/monitorAccounts')
// setInterval(monitorAccounts, 2000)

module.exports = app
