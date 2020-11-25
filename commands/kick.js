const Command = require('../strucutres/Command')
const Discord = require('discord.js')

class Kick extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = true
        this.category = 'Moderação'
        this.description = 'Kickar um membro.'
        this.usage = ['usuário razão']
        this.permissions = ['KICK_MEMBERS']
    }

    async run(message, args, { prefix }) {
        const member = message.mentions.members.first()
        const embed = new Discord.MessageEmbed()
            .setColor(this.client.config.color)
        if (!member) return message.reply(embed.setTitle('Por favor mencione um usuário válido!'))
        let reason = args.slice(1).join(' ')
        if (!reason) reason = 'Nenhuma razão fornecida'

        await member.kick(reason)

        message.channel.send(embed.setTitle(`${member.user.tag} foi kickado.`))

        embed.setTitle('🦶🏽 Kick')
            .addField('Membro Kickado:', `${member.user.tag}`)
            .addField('Mutado por:', `${message.author.tag}`)
            .addField('Motivo:', `${reason}`)
            .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('RANDOM').setTimestamp()

        const channel = message.guild.channels.cache.get(this.client.config.channels.mute)
        if (channel) return channel.send(embed)
        else message.channel.send(embed)
    }
}

module.exports = Kick