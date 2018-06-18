const dateFormat = require('dateformat')

const formatAction = (action) => {
  // console.log('display action: ', JSON.stringify(action))
  // return JSON.stringify(action, null, 2)
  return `${dateFormat(Date.parse(action.block_time), '🗓 *ddd, mmm dS, yyyy, 🕐 h:MM:ss*')}\n🗳 block #${action.block_num} seq#${action.account_action_seq}\n\n📋action *${action.action_trace.act.name}* 🗄account *${action.action_trace.act.account}*\n\n
  🔎 data: ${JSON.stringify(action.action_trace.act.data, null, 2)}`
}

module.exports = formatAction
