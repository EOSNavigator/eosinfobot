const producerSearch = async query => {
  return [{
    type: 'article',
    parse_mode: 'markdown',
    id: query,
    title: `${query}: 
    ${'votes: '}`,
    thumb_url: 'http://eosamsterdam.net/img/logo-symbol.png',
    message_text: `[${query}]`
  }]
}

module.exports = producerSearch
