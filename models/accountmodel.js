const mongoose = require('mongoose')

const accountSchema = mongoose.Schema({
  account_name: {type: String, required: true, max: 12},
  last_update: {type: Date, default: Date.now},
  last_action_seq: {type: Number, default: -1},
  users: {type: Array, default: []}
})

accountSchema.methods.info = function () {
  var details = this.account_name
    ? 'Account: ' + this.account_name
    : 'No account name found'
  console.log(details)
}

module.exports = mongoose.model('SomeModel', accountSchema)
