require('dotenv').config()

const secret = {
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token_key: process.env.TWITTER_TOKEN,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
}

var TwitterPackage = require('twitter')
const Twitter = new TwitterPackage(secret)

const sendTwitt = (message, imageFile) => {
  const data = require('fs').readFileSync(imageFile)

  // Make post request on media endpoint. Pass file data as media parameter
  Twitter.post('media/upload', {media: data}, (error, media, response) => {
    if (error) return console.log(error)
    console.log(media)

    // Lets tweet it
    const status = {
      status: message,
      media_ids: media.media_id_string
    }

    console.log('sending twitt: ', status)

    Twitter.post('statuses/update', status, (error, tweet, response) => {
      if (error) return console.log(error)
      console.log(tweet)
      console.log(response)
    })
  })
}

module.exports = sendTwitt
