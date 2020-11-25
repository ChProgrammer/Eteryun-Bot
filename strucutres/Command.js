class Command {
  constructor(client) {
    this.client = client
    this.displayName = 'none'
    this.name = 'none'
    this.category = 'general'
    this.description = 'No description.'
    this.usage = []
    this.aliases = []
    this.guildOnly = false
    this.requiredArgs = false
    this.permissions = []
    this.clientPermissions = []
  }

  async run() {
    throw new Error(`Function run undefined in ${this.constructor.name}.`)
  }

  getUsage(prefix) {
    if (this.usage.length > 0) {
      return this.usage.map(item => `> ${prefix + this.name} ${item}`).join('\n')
    } else {
      return `> ${prefix}${this.name}`
    }
  }

  getUsageEmbed(prefix) {
    return {
      embed: {
        "title": "Talvez isso possa ajudá-lo - Exemplos:",
        "description": this.getUsage(prefix),//this.usage.map(item => `**${prefix + this.name} ${item}**`).join('\n'),
        "color": this.client.config.color
      }
    }
  }

  async _run(message, args, content) {
    if (!message.guild && this.guildOnly) return

    if (message.channel.id !== this.client.config.channels.commands){
      if (!message.channel.permissionsFor(message.member).has('ADMINISTRATOR')){
        return message.delete()
      }
    }

    const permissions = message.guild && this.permissions.filter(p => !message.channel.permissionsFor(message.member).has(p)).map(p => `\`${permissionsName[p]}\``)
    if (this.permissions.length > 0 && permissions && permissions.length > 0) {
      return message.channel.send(`Você não tem as permissões necessarias. ${permissions.join(', ')}`)
    }

    const clientPermissions = message.guild && this.clientPermissions.filter(p => !message.channel.permissionsFor(message.guild.me).has(p)).map(p => `\`${permissionsName[p]}\``)
    if (this.clientPermissions.length > 0 && clientPermissions && clientPermissions.length > 0) {
      return message.channel.send(`Você não tem as permissões necessarias. ${clientPermissions.join(', ')}`)
    }

    if (args.length === 0 && this.requiredArgs) {
      return message.reply(this.getUsageEmbed(content.prefix))
    }
    return await this.run(message, args, content)
  }
}

module.exports = Command
const permissionsName = require('../utils/permissions.json')