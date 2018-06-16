const beautify = require("json-beautify")

const formatAction = (action) => {
  console.log('display action: ', JSON.stringify(action))
  return beautify(action, null, 2, 100)
}

module.exports = formatAction
