const { Composer, log, session, Markup } = require('micro-bot')
const msg = require('./messages')
const Eos = require('eosjs')
const producerSearch = require('./lib/producerSearch')

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
// app.hears(/(так)|(ишо)/i, ctx => ctx.replyWithMarkdown(msg.formatQuote(getQuote({ details: true }))))

module.exports = app
