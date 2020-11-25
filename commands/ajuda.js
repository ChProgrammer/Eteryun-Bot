const Command = require('../strucutres/Command')
const Discord = require("discord.js")

class Ajuda extends Command {
    constructor(client) {
        super(client)
        this.category = 'Help'
        this.description = 'Mostra todos os comandos disponíveis do bot.'
    }

    async run(message, _, { prefix }) {
        let fields = []
        for (const command of this.client.commands.array()) {
            if (command.name !== 'help') {
                const permissions = message.guild && command.permissions.filter(p => !message.channel.permissionsFor(message.member).has(p)).map(p => `\`${p}\``)
                if (permissions.length == 0) {
                    fields.push({
                        'name': `**${command.name}**`,
                        'value': `**Descrição**: ${command.description}\n **Como Usar**:\n ${command.getUsage(prefix)}`
                    })
                }
            }
        }

        try {
            const embed = new Discord.MessageEmbed()
                .setColor(this.client.config.color)
                .setTitle('Lista de Comandos')
                .setDescription('➦ Todos os comandos disponíveis')
                .addFields(fields)
                .setAuthor('Desenvolvido por Ramon Rodrigues', '', 'https://www.linkedin.com/in/ramon-rodrigues-pa')
            await message.author.send(embed)
            await message.react('👌')
        } catch (_) {
            const embed = new Discord.MessageEmbed()
                .setColor(this.client.config.color)
                .setTitle('Desculpe, mas eu não tenho permissões para enviar mensagens por DM para você!')
            await message.reply(embed)
        }
    }
}

module.exports = Ajuda