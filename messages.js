const formatQuote = ({ quote, song, album }) => `
${quote.title}

_${song.title} (${album.title} ${album.year})_
`

const start = `
Welcome to *EOS Info*,
Your Telegram assistant for everything *EOS*.
trained by *EOSNavigator.com* team.

type */info* to get current blockchain details
`

const help = `
type */info* to get current blockchain details

`

module.exports = { formatQuote, help, start }