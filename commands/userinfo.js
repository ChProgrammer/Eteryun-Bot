const Command = require('../strucutres/Command')
const Discord = require("discord.js")

function formatDate(template, date) {
    const specs = 'YYYY:MM:DD:HH:mm:ss'.split(':')
    date = new Date(date || Date.now() - new Date().getTimezoneOffset() * 6e4)
    return date.toISOString().split(/[-:.TZ]/).reduce(function (template, item, i) {
        return template.split(specs[i]).join(item)
    }, template)
}


class UserInfo extends Command {
    constructor (client) {
      super(client)
      this.guildOnly = true
      this.category = 'Moderação'
      this.description = 'Retornar info do membro.'
    }
  
    run (message) {
      const member = message.mentions.members.first() || message.member
      const embed = new Discord.MessageEmbed()
          .setColor(this.client.config.color)
          .setTitle(member.user.tag)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
          .addField('ID:', member.user.id, true)
          .addField('Nickname:', member.nickname || 'None', true)
          .addField('Created At:', formatDate('DD/MM/YYYY, às HH:mm:ss', member.user.createdAt), true)
          .addField('Joined At:', formatDate('DD/MM/YYYY, às HH:mm:ss', member.joinedAt), true)
          .addField('Bot:', `${member.user.bot}`, true)
          .addField('Status:', member.user.presence.status, true)
          .addField('Game:', (member.user.presence.game && member.user.presence.game.name) || 'None', true)
          .addField('Roles:', member.roles.cache.map(role => role.name).join(', '), true)
      message.channel.send(embed)
    }
  }
  
  module.exports = UserInfo