const Command = require('../strucutres/Command')
const queue = require('../utils/Queue')
const Discord = require('discord.js')

class Mute extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = true
        this.category = 'Moderação'
        this.description = 'Mutar membro por um tempo determinado.'
        this.usage = ['usuário tempo razão']
        this.permissions = ['MUTE_MEMBERS']
    }

    async run(message, args, { prefix }) {
        const member = message.mentions.members.first()
        const embed = new Discord.MessageEmbed()
            .setColor(this.client.config.color)
        if (!member) return message.reply(embed.setTitle('Por favor mencione um usuário válido!'))
        if (!member.bannable) return message.reply(embed.setTitle('Eu não posso mutar esse usuário, ele pode ter um cargo maior que o meu.'))

        let reason = args.slice(2).join(' ')
        if (!reason) reason = 'Nenhuma razão fornecida'

        let time = args[1] || '1'
        const role = message.guild.roles.cache.get(this.client.config.mutedRole)
        const memberRoles = member.roles.cache.map(r => r.id)

        if (queue.muteded.has(member)) return message.reply(embed.setTitle(`${member} já foi mutado por ${queue.muteded.get(member).time}m`))

        try {
            member.roles.set([role])
        } catch (error) {
            console.log(erro, 'Error')
        }

        message.channel.send(embed.setTitle(`${member.user.tag} foi mutado por ${time}m.`))

        const timeout = setTimeout(() => {
            member.roles.set(queue.muteded.get(member).roles)
            queue.muteded.delete(member)
        }, 60000*time)
        
        queue.muteded.set(member, { roles: memberRoles, time, timeout })

        embed.setTitle(':mute: Mute')
            .addField('Membro Mutado:', `${member.user.tag}`)
            .addField('Mutado por:', `${message.author.tag}`)
            .addField('Tempo:', `${time}m`)
            .addField('Motivo:', `${reason}`)
            .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
            .setColor('RANDOM').setTimestamp()

        const channel = message.guild.channels.cache.get(this.client.config.channels.mute)
        if (channel) return channel.send(embed)
        else message.channel.send(embed)
    }
}

module.exports = Mute