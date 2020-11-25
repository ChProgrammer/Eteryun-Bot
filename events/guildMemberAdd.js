const Discord = require("discord.js")
const moment = require('moment-timezone')

module.exports = async function onMemberGuildAdd(member) {
  const daysSinceCreation = moment().diff(moment(member.user.createdAt), 'days')
  //const isDefaultAvatar = message.member.user.displayAvatarURL().startsWith('https://discordapp.com/')
  if (daysSinceCreation < 30)
    return (() => {
      member.send('Olá! você foi kickado automaticamente por conter menos de 30 dias de conta').catch()
      member.kick('Autokick: Usuário com menos de 30 dias no discord').catch()
    })()

  const emoji = member.guild.emojis.cache.find(r => r.name == 'dancing_parrot')
  
  let embed = await new Discord.MessageEmbed()
    .setColor("#7c2ae8")
    .setAuthor(member.user.tag, member.user.displayAvatarURL())
    .setTitle(`${emoji} Opaa ${emoji}`)
    .setImage("https://media.giphy.com/media/UQPhrdc2jYJ3twr2S9/giphy.gif")
    .setDescription(`Bem vindo ao servidor ${member.guild.name}**${member.user}**. \n\nEsse é um servidor privado que estou montando com uma galera \n\nCom o objetivo de montar um servidor survival no estilo mmorpg`)
    .addField('Atenção', 'Por Favor, leia as regras <#729385003154276352> e siga todas para evitar Punições!')
    .addField('Pedir Tag', 'Acesse <#729386909100408903> caso queira umas das Tags disponíveis em nosso discord. \n\n\Caso tenha alguma dúvida, chame um <@&729389248339247104> ou <@&729385845131313184>')

    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))

  const channel = this.config.channels.welcome && member.guild.channels.cache.get(this.config.channels.welcome)

  if (!channel) return
  channel.send(embed)

  member.roles.set(this.config.welcome.roleToset)
}