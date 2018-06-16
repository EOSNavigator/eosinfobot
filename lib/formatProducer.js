const beautify = require("json-beautify")

const formatProducer = (producer) => {
  console.log('format producer: ', beautify(producer, null, 2, 100))
  return beautify(producer, null, 2, 100)
}

module.exports = formatProducer
