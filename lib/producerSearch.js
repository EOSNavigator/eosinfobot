const fs = require('fs')
const path = require('path')

var jsonDirPath = path.join(__dirname, '..', 'bp')
console.log('path to bp dir: ', jsonDirPath)

// Read producers from json files
let producers = []
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

const producerSearch = async (query, offset) => {
  const lcQuery = query.toLowerCase()
  const selectedProducers = producers.filter(p => p.title.toLowerCase().includes(lcQuery) || p.account_name.includes(lcQuery)).slice(offset, offset + 5)
  console.log('offset: ', offset, 'selected ', selectedProducers.length)
  return selectedProducers.map(({ account_name, title, tagline, org, introduce }) =>
    ({
      type: 'article',
      parse_mode: 'markdown',
      id: account_name,
      title: title + ' (' + account_name + ')',
      description: org.location,
      thumb_url: 'http://raw.githubusercontent.com/consenlabs/eos-bp-profile/master/images/' + org.branding.logo,
      url: org.website,
      message_text: title + ' (' + account_name + ') \n' +
      tagline.en + '\n\n' +
      'location: ' + org.location + ' \n' +
      (org.hasOwnProperty('social_network') && org.social_network.hasOwnProperty('telegram') ? `telegram: ${org.social_network.telegram} \n` : '')
    }))
}

module.exports = producerSearch
