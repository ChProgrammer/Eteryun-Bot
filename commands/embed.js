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
                color = await this.sendQuestion('Embed', '> Digite a cor do embed:', channel, author, true)
            } while (!(this.validHexColor(color) || color.toLowerCase() == 'pular'))
            if (color.toLowerCase() != 'pular') {
                embed.setColor(color)
            }

            let thumbmail
            do {
                thumbmail = await this.sendQuestion('Embed', '> Cole o link da Thumbmail:', channel, author, true)
            } while (!(this.validURL(thumbmail) || thumbmail.toLowerCase() == 'pular'))
            if (thumbmail.toLowerCase() != 'pular') {
                embed.setThumbnail(thumbmail)
            }

            let image
            do {
                image = await this.sendQuestion('Embed', '> Cole o link da Imagem:', channel, author, true)
            } while (!(this.validURL(image) || image.toLowerCase() == 'pular'))
            if (image.toLowerCase() != 'pular') {
                embed.setImage(image)
            }

            let title = await this.sendQuestion('Embed', '> Digite o titulo:', channel, author, true)
            if (title.toLowerCase() != 'pular')
                embed.setTitle(title)

            let description = await this.sendQuestion('Embed', '> Digite a descrição:', channel, author, true)
            if (description.toLowerCase() != 'pular')
                embed.setDescription(description)

            let fieldInLine, fieldLoop
            do {
                fieldInLine = await this.sendQuestion('Embed', '> Deseja adicionar um campo InLine? (Sim/Não)', channel, author)
            } while (!(fieldInLine.toLowerCase() == 'sim' || fieldInLine.toLowerCase() == 'não'))

            if (fieldInLine.toLowerCase() == 'sim'){
                do {
                    let inlineName = await this.sendQuestion('Embed', '> Digite o nome do campo Inline:', channel, author, true)
                    let inline = await this.sendQuestion('Embed', '> Digite a mensagem do campo Inline:', channel, author, true)
                    if (inlineName != 'pular' || inline.toLowerCase != 'pular'){
                        embed.addField(inlineName, inline, true)
                    }
                    fieldLoop = await this.sendQuestion('Embed', '> Deseja adicionar outro inline? (Sim/Não)', channel, author)
                } while (fieldLoop.toLowerCase() != 'não')
            }

            let haveAuthor, authorName, authorIcon, authorUrl
            do {
                haveAuthor = await this.sendQuestion('Embed', '> Deseja adicionar um autor? (Sim/Não)', channel, author)
            } while (!(haveAuthor.toLowerCase() == 'sim' || haveAuthor.toLowerCase() == 'não'))

            if (haveAuthor.toLowerCase() == 'sim') {
                authorName = await this.sendQuestion('Embed', '> Digite o nome do author', channel, author)
                do {
                    authorIcon = await this.sendQuestion('Embed', '> Cole o link do icone do author:', channel, author, true)
                } while (!(this.validURL(authorUrl) || authorIcon.toLowerCase() == 'pular'))
                do {
                    authorUrl = await this.sendQuestion('Embed', '> Cole o link do site do author:', channel, author, true)
                } while (!(this.validURL(authorUrl) || authorUrl.toLowerCase() == 'pular'))

                embed.setAuthor(authorName, authorIcon.toLowerCase() == 'pular' ? '' : authorIcon, authorUrl.toLowerCase() == 'pular' ? '' : authorUrl)
            }

            let haveFooter, footerText, footerIcon
            do {
                haveFooter = await this.sendQuestion('Embed', '> Deseja adicionar um rodapé? (Sim/Não)', channel, author)
            } while (!(haveFooter.toLowerCase() == 'sim' || haveFooter.toLowerCase() == 'não'))

            if (haveFooter.toLowerCase() == 'sim') {
                footerText = await this.sendQuestion('Embed', '> Digite o texto do rodapé', channel, author)
                do {
                    footerIcon = await this.sendQuestion('Embed', '> Cole o link do icone do rodapé:', channel, author, true)
                } while (!(this.validURL(footerIcon) || footerIcon.toLowerCase() == 'pular'))

                embed.setFooter(footerText, footerIcon.toLowerCase() == 'pular' ? '' : footerIcon)
            }
                
            let markEveryone;
            do {
                markEveryone = await sendQuestion('Embed', '> Deseja marcar Everyone na sua mensagem? (Sim/Não)', channel, author)
            } while (!(markEveryone.toLowerCase() == 'sim' || markEveryone.toLowerCase() == 'não'))
                
            if(markEveryone.toLowerCase() == 'sim'){
                await channelEmbed.send("@everyone").then(msg => {
                    msg.delete({ timeout: 1000 });
                })
            }

            await channelEmbed.send(embed);
            return message.reply("Sua embed foi enviada com sucesso!");

        } catch (error) {
            console.log(error)
            this.sendEmbed(channel, 'Error', 'Seu tempo expirou')
        }
    }
}

module.exports = Embed
