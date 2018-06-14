const { Composer, log, session, Markup } = require('micro-bot')
const msg = require('./messages')
const Eos = require('eosjs')

// Default configuration
const config = {
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  httpEndpoint: 'https://eos.greymass.com',
  expireInSeconds: 60,
  broadcast: true,
  debug: false,
  sign: true
}

const eos = Eos(config)
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

app.command('info', ({ reply }) => 
  eos.getInfo((error, result) => {
    reply(`info: ${JSON.stringify(result)}`)
    console.log(error, JSON.stringify(result))
  })
)

app.command('help', ctx => ctx.replyWithMarkdown(msg.help))

module.exports = app
