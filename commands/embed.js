const Command = require('../strucutres/Command')
const Discord = require('discord.js')

class Embed extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = true
        this.category = 'Administração'
        this.description = 'Enviar mensagens embed usando o bot.'
        this.usage = ['#canal']
        this.permissions = ['ADMINISTRATOR']
    }

    validURL(str) {
        const pattern = new RegExp('^(https?:\\/\\/)?' +
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
            '((\\d{1,3}\\.){3}\\d{1,3}))' +
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
            '(\\?[;&a-z\\d%_.~+=-]*)?' +
            '(\\#[-a-z\\d_]*)?$', 'i')
        return !!pattern.test(str)
    }

    validHexColor(hex) {
        const pattern = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', 'i')
        return !!pattern.test(hex)
    }

    getChannelFromMetion(mention, guild) {
        if (!mention) return null

        if (mention.startsWith('<#') && mention.endsWith('>')) {
            mention = mention.slice(2, -1)

            return guild.channels.cache.get(mention)
        }
    }

    async sendQuestion(question, channel, author, skip = false) {
        return new Promise((resolve, reject) => {
            const embed = new Discord.MessageEmbed()
                .setColor(this.client.config.color)
                .setTitle(`Embed`)
                .setDescription(question)

            if (skip) {
                embed.setFooter('Deseja pular está opção? Digite: \'pular\'')
            }

            channel.send(embed).then((msg) => {
                channel.awaitMessages(m => m.author.id === author.id, {
                    max: 1,
                    time: 300000
                })
                    .then(collected =>
                        resolve(collected.first().content)
                    ).catch(error =>
                        reject(error))
            })
        })
    }

    async sendEmbed(title, description, channel) {
        const embed = new Discord.MessageEmbed()
            .setColor(this.client.config.color)
            .setTitle(title)
            .setDescription(description)
        channel.send(embed)
    }

    async run(message, args, { prefix }) {
        const channel = message.channel
        const author = message.author

        if (args.length != 1)
            return message.channel.send(this.getUsageEmbed(prefix, true))

        const channelEmbed = this.getChannelFromMetion(args[0], message.guild)

        if (!channelEmbed)
            return message.channel.send(this.getUsageEmbed(prefix, true))

        const embed = new Discord.MessageEmbed()

        try {
            let color
            do {
                color = await this.sendQuestion('> Digite a cor do embed:', channel, author, true)
            } while (!(this.validHexColor(color) || color == 'pular'))
            if (color != 'pular') {
                embed.setColor(color)
            }

            let thumbmail
            do {
                thumbmail = await this.sendQuestion('> Cole o link da Thumbmail:', channel, author, true)
            } while (!(this.validURL(thumbmail) || thumbmail == 'pular'))
            if (thumbmail != 'pular') {
                embed.setThumbnail(thumbmail)
            }

            let image
            do {
                image = await this.sendQuestion('> Cole o link da Imagem:', channel, author, true)
            } while (!(this.validURL(image) || image == 'pular'))
            if (image != 'pular') {
                embed.setImage(image)
            }

            let title = await this.sendQuestion('> Digite o titulo:', channel, author, true)
            if (title != 'pular')
                embed.setTitle(title)

            let description = await this.sendQuestion('> Digite a descrição:', channel, author, true)
            if (description != 'pular')
                embed.setDescription(description)

            let haveAuthor, authorName, authorIcon, authorUrl
            do {
                haveAuthor = await this.sendQuestion('> Deseja adicionar um autor? (Sim/Não)', channel, author)
            } while (!(haveAuthor == 'Sim' || haveAuthor == 'Não'))

            if (haveAuthor == 'Sim') {
                authorName = await this.sendQuestion('> Digite o nome do author', channel, author)
                do {
                    authorIcon = await this.sendQuestion('> Cole o link do icone do author:', channel, author, true)
                } while (!(this.validURL(authorUrl) || authorIcon == 'pular'))
                do {
                    authorUrl = await this.sendQuestion('> Cole o link do site do author:', channel, author, true)
                } while (!(this.validURL(authorUrl) || authorUrl == 'pular'))

                embed.setAuthor(authorName, authorIcon == 'pular' ? '' : authorIcon, authorUrl == 'pular' ? '' : authorUrl)
            }

            let haveFooter, footerText, footerIcon
            do {
                haveFooter = await this.sendQuestion('> Deseja adicionar um rodapé? (Sim/Não)', channel, author)
            } while (!(haveFooter == 'Sim' || haveFooter == 'Não'))

            if (haveFooter == 'Sim') {
                footerText = await this.sendQuestion('> Digite o texto do rodapé', channel, author)
                do {
                    footerIcon = await this.sendQuestion('> Cole o link do icone do rodapé:', channel, author, true)
                } while (!(this.validURL(footerIcon) || footerIcon == 'pular'))

                embed.setFooter(footerText, footerIcon == 'pular' ? '' : footerIcon)
            }

            await channelEmbed.send(embed)

        } catch (error) {
            console.log(error)
            this.sendEmbed('Error', 'Seu tempo expirou', channel)
        }
    }
}

module.exports = Embed