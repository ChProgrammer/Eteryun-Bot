const config = require('./config.json')

const Bot = require('./strucutres/Bot')
const client = new Bot()

client.start(config.token)