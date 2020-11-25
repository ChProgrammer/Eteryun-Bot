const { Collection, Client } = require('discord.js')
const { getFiles } = require('../utils/FileUtils')
const config = require('../config.json')

class Bot extends Client {
  constructor(options) {
    super(options)
    this.commands = new Collection()
    this.config = config
  }

  async initializeCommands(path = 'commands') {
    return await getFiles(path, (Command, name) => {
      const command = new Command(this)
      if (command.name === 'none') command.name = name
      if (command.displayName === 'none') command.displayName = name
      this.commands.set(name, command)
    }, console.error)
  }

  async initializeListeners(path = 'events') {
    return await getFiles(path, (Event, name) => this.on(name, Event), console.error)
  }

  async start(token = null) {
    await this.initializeCommands()
    await this.initializeListeners()
    await this.login(token)
  }
}

module.exports = Bot