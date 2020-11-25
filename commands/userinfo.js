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
  constructor(client) {
    super(client)
    this.guildOnly = true
    this.category = 'Moderação'
    this.description = 'Retornar info do membro.'
  }

  run(message) {
    const member = message.mentions.members.first() || message.member
    const embed = new Discord.MessageEmbed()
      .setColor(this.client.config.color)
      .setTitle(member.user.username)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addField(':bookmark: Tag do Discord', `\`${member.user.tag}\``, true)
      .addField(':computer: ID do Discord', `\`${member.user.id}\``, true)
      .addField(':date: Criado em:', formatDate('DD/MM/YYYY, às HH:mm:ss', member.user.createdAt), true)
      .addField(':date: Ingressou em:', formatDate('DD/MM/YYYY, às HH:mm:ss', member.joinedAt), true)
      .addField(':robot: Bot:', `${member.user.bot ? 'Sim' : 'Não'}`, true)
    message.channel.send(embed)
  }
}

module.exports = UserInfo