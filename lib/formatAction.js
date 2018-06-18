const dateFormat = require('dateformat')

const niceDate = (x) => dateFormat(Date.parse(x), '🗓 <b>ddd, mmm dS, yyyy, 🕐 h:MM:ss</b>')

const formatAction = (action) => {
  // console.log('display action: ', JSON.stringify(action))
  // return JSON.stringify(action, null, 2)
  let text = niceDate(action.block_time) + '🗳 block #' + action.block_num + ' seq#' + action.account_action_seq + ' \n' +
  '📋 <b>' + action.action_trace.act.name + '</b> 🗄 <b>' + action.action_trace.act.account + ' </b> \n' +
  'Data: \n' + JSON.stringify(action.action_trace.act.data, null, 4)
  // const urlRegex = /(https?:\/\/[^"\s]+)/g
  // text = text.replace(urlRegex, (url) => '[inline URL](' + url + ')')
  return text
}

module.exports = formatAction
