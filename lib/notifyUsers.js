require('dotenv').config()

// Connect Telegram Bot
const Telegram = require('telegraf/telegram')
const bot = new Telegram(process.env.BOT_TOKEN)

const notifyUsers = async (account, message) => {
  console.log('notify users on account change...')
  account.users.forEach(user => {
    bot.sendMessage(user.chat.id, message)
  })
}

module.exports = notifyUsers
