const start = `
Welcome to *EOS Info bot*,

Your Telegram assistant for everything *EOS*.
trained by [*EOSNavigator.com*](http://eosnavigator.com) team.

*/info* - get current blockchain details
*/account* _account name_ - get account info
*/producers* - top50 producers
*/watch_account* _account name_ - subscribe to get messages every time there is a new transaction
*/block* _block number_ - get block details
*/stop* - cancel all subscriptions
`

const help = `
*/info* - get current blockchain details
*/account* _account name_ - get account info
*/producers* - top50 producers
*/watch_account* _account name_ - subscribe to get messages every time there is a new transaction
*/block* _block number_ - get block details
*/stop* - cancel all subscriptions
`

module.exports = { help, start }
