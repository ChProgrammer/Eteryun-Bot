const Command = require('../strucutres/Command')
const Discord = require('discord.js')

class Ban extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = true
        this.category = 'Moderação'
        this.description = 'Banir usuário do servidor.'
        this.usage = ['usuário razão']
        this.permissions = ['BAN_MEMBERS']
    }

    async run(message, args, { prefix }) {
        const member = message.mentions.members.first()
        const embed = new Discord.MessageEmbed()
            .setColor(this.client.config.color)
        if (!member) return message.reply(embed.setTitle('Por favor mencione um usuário válido!'))
        if (!member.bannable) return message.reply(embed.setTitle('Eu não posso banir esse usuário, ele pode ter um cargo maior que o meu.'))

        let reason = args.slice(1).join(' ')
        if (!reason) reason = 'Nenhuma razão fornecida'
        await member.ban({ reason })
            .catch(error => message.reply(embed.setTitle(`Desculpe ${message.author} não consegui banir o membro devido o: ${error}`)))

        embed.setTitle(`${message.guild.emojis.cache.find(r => r.name == 'BanHam')} Ban`)
            .addField('Membro Banido:', `${member.user.tag}`)
            .addField('Banido por:', `${message.author.tag}`)
            .addField('Motivo:', `${reason}`)
            .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('DARK_RED').setTimestamp()

        const channel = message.guild.channels.cache.get(this.client.config.channels.ban)
        if (channel) return channel.send(embed)
        else message.channel.send(embed)
    }
}

module.exports = Ban