const Command = require('../strucutres/Command')
const queue = require('../utils/Queue')
const Discord = require('discord.js')

class UnMute extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = true
        this.category = 'Moderação'
        this.description = 'Desmutar um membro.'
        this.usage = ['usuário']
        this.permissions = ['MUTE_MEMBERS']
    }

    async run(message, args, { prefix }) {
        const member = message.mentions.members.first()
        const embed = new Discord.MessageEmbed()
            .setColor(this.client.config.color)
        if (!member) message.reply(embed.setTitle('Por favor mencione um usuário válido!'))


        if (!queue.muteded.has(member)) return message.reply(embed.setTitle(`${member} não está mutado.`))

        message.channel.send(embed.setTitle(`${member.user.tag} foi desmutado.`))

        member.roles.set(queue.muteded.get(member).roles)
        clearInterval(queue.muteded.get(member).timeout)
        queue.muteded.delete(member)

        embed.setTitle(':mute: Unmute')
            .addField('Membro Desmutado:', `${member.user.tag}`)
            .addField('Desmutado por:', `${message.author.tag}`)
            .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('RANDOM').setTimestamp()

        const channel = message.guild.channels.cache.get(this.client.config.channels.mute)
        if (channel) return channel.send(embed)
        else message.channel.send(embed)
    }
}

module.exports = UnMute