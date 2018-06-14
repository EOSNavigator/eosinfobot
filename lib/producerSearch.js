let producers = []

const fs = require('fs')
const path = require('path')

var jsonDirPath = path.join(__dirname, '..', 'bp')
console.log('path to bp dir: ', jsonDirPath)

fs.readdir(jsonDirPath, function (err, items) {
  if (err) console.log(err)
  else {
    for (let i = 0; i < items.length; i++) {
      if (items[i] !== '$template.json') {
        console.log('process producer json file: ', items[i])
        producers.push(
          Object.assign({imagePath: path.join(__dirname, '..', 'images')},
            JSON.parse(fs.readFileSync(path.join(jsonDirPath, items[i])), 'utf8')
          )
        )
      }
    }
    console.log('found: ', producers.length, ' producers')
  }
})

const producerSearch = async query => {
  const selectedProducers = producers.filter(p => p.account_name.startsWith(query))
  return selectedProducers.map(({ account_name, title, tagline, org, imagePath }) =>
    ({
      type: 'article',
      parse_mode: 'markdown',
      id: account_name,
      title: `${title}: ${tagline.en}`,
      // thumb_url: path.join('http://raw.githubusercontent.com/consenlabs/eos-bp-profile/master/images/', `logo-${account_name}.png`),
      message_text: `[
      ${org.website}
      ${org.location}
      ]`
    }))
}

module.exports = producerSearch
