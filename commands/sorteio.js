const Command = require('../strucutres/Command')
const Discord = require('discord.js')
const moment = require('moment-timezone')
const queue = require('../utils/Queue')

String.prototype.replaceAll = function (from, to) {
    let str = this
    let pos = str.indexOf(from)
    while (pos > -1) {
        str = str.replace(from, to)
        pos = str.indexOf(from)
    }
    return (str)
}

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
}

class Sorteio extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = true
        this.category = 'Moderação'
        this.description = 'Criar um sorteio.'
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

    getChannelFromMetion(mention, guild) {
        if (!mention) return null

        if (mention.startsWith('<#') && mention.endsWith('>')) {
            mention = mention.slice(2, -1)

            return guild.channels.cache.get(mention)
        }
    }

    async selectWinners(giveaway) {
        let selectedWinners = []
        console.log('Selecionando sorteados')

        console.log(giveaway.participants)

        while (selectedWinners.length < giveaway.totalWinners) {
            let userRandom = giveaway.participants.random()
            if (selectedWinners.indexOf(userRandom) == -1) {
                selectedWinners.push(userRandom)
            }
        }

        selectedWinners = selectedWinners.map((item, index) => `➔ ${index + 1} - <@${item}>`).join('\n')

        if (giveaway.participants.length == 0)
            selectedWinners = 'Nenhum ganhador!'

        return selectedWinners
    }

    async giveawayMessage(giveaway, selectedWinners) {
        const arrow = this.client.emojis.cache.find(emoji => emoji.name === 'arrowleftanimated')
        let data = giveaway.endTime.format('DD/MM/YYYY')
        let hours = giveaway.endTime.format('HH:mm:ss')

        const embed = new Discord.MessageEmbed()
            .setColor(this.client.config.color)
            .setTitle(giveaway.title)
            .addFields([
                {
                    'name': '> Sorteio de: ',
                    'value': `${giveaway.description}`,
                    'inline': true
                },
                {
                    'name': '> Total de ganhadores:',
                    'value': `${arrow} ${giveaway.totalWinners}`,
                    'inline': true
                },
                {
                    'name': '\u200B',
                    'value': '\u200B',
                    'inline': true
                },
                {
                    'name': '> Ganhadores:',
                    'value': `${selectedWinners}`,
                    'inline': true
                },
                {
                    'name': '> Data de finalização:',
                    'value': `${arrow} Dia ${data} ás ${hours}`,
                    'inline': true
                }
            ]).setFooter(`Bot Desenvolvidor por - ramon#5522`)

        if (giveaway.image != 'pular') {
            embed.setImage(giveaway.image)
        }
        if (giveaway.thumbmail != 'pular') {
            embed.setThumbnail(giveaway.thumbmail)
        }

        return embed
    }

    async giveaway(id) {
        console.log('Sorteando', id)
        const giveaway = queue.giveaway.get(id)
        let message = giveaway.message
        if (giveaway.participants.length < giveaway.totalWinners && giveaway.participants.length != 0)
            giveaway.totalWinners = giveaway.participants.length

        console.log(giveaway.participants)

        let selectedWinners = await this.selectWinners(giveaway)
        const embed = await this.giveawayMessage(giveaway, selectedWinners)

        try {
            await message.delete()
        } catch (error) { }
        message.channel.send(embed)
        giveaway.status = 1
    }

    async run(message, args, { prefix }) {
        const channel = message.channel
        const author = message.author

        if (args.length == 2) {
            if (args[0] == 'stop') {
                let id = args[1]
                let giveaway = queue.giveaway.get(id)
                if (giveaway) {
                    if (giveaway.status != 0)
                        return this.sendEmbed(channel, 'Error', 'Sorteio já ocorrido')

                    clearTimeout(giveaway.timeout)
                    try {
                        await giveaway.message.delete()
                    } catch (error) { }
                    queue.giveaway.delete(id)
                    return this.sendEmbed(channel, 'Sucesso', 'Sorteio apago')
                } else {
                    return this.sendEmbed(channel, 'Error', 'Sorteio inexistente')
                }
            } else if (args[0] == 'draw') {
                let id = args[1]
                let giveaway = queue.giveaway.get(id)
                if (giveaway) {
                    this.giveaway(id)
                    clearTimeout(giveaway.timeout)
                    return this.sendEmbed(channel, 'Sucesso', 'Sorteando...')
                } else {
                    return this.sendEmbed(channel, 'Error', 'Sorteio inexistente')
                }
            }
        }

        if (args.length != 1)
            return message.channel.send(this.getUsageEmbed(prefix, true))

        const channelGiveaway = this.getChannelFromMetion(args[0], message.guild)

        if (!channelGiveaway)
            return message.channel.send(this.getUsageEmbed(prefix, true))

        const embed = new Discord.MessageEmbed()
            .setColor(this.client.config.color)

        const arrow = this.client.emojis.cache.find(emoji => emoji.name === 'arrowleftanimated')

        try {
            let thumbmail
            do {
                thumbmail = await this.sendQuestion('Sorteio', '> Cole o link da Thumbmail:', channel, author, true)
            } while (!(this.validURL(thumbmail) || thumbmail.toLowerCase() == 'pular'))
            if (thumbmail.toLowerCase() != 'pular') {
                embed.setThumbnail(thumbmail)
            }

            let image
            do {
                image = await this.sendQuestion('Sorteio', '> Cole o link da Imagem:', channel, author, true)
            } while (!(this.validURL(image) || image.toLowerCase() == 'pular'))
            if (image.toLowerCase() != 'pular') {
                embed.setImage(image)
            }

            const title = await this.sendQuestion('Sorteio', '> Digite o Titulo do sorteio:', channel, author)
            embed.setTitle(title)

            const description = await this.sendQuestion('Sorteio', '> Digite a descrição do sorteio:', channel, author)

            let rules = ''
            do {
                rules = await this.sendQuestion('Sorteio', '> Digite as regras do sorteio:', channel, author, true)
            } while ((rules.toLowerCase() == 'pular' || rules == ''))

            let totalWinners
            do {
                totalWinners = parseInt(await this.sendQuestion('Sorteio', '> Digite o total de ganhadores:', channel, author))
            } while (!(!isNaN(totalWinners) && totalWinners > 0))

            let duration
            do {
                duration = parseInt(await this.sendQuestion('Sorteio', '> Digite a duração em minutos:', channel, author))
            } while (!(!isNaN(duration) && duration > 0))

            embed.addFields([
                {
                    'name': '> Sorteio de: ',
                    'value': `${description}`,
                    'inline': true
                },
                {
                    'name': '> Total de ganhadores:',
                    'value': `${arrow} ${totalWinners}`,
                    'inline': true
                },
                {
                    'name': '\u200B',
                    'value': '\u200B',
                    'inline': true
                },
                {
                    'name': '> Como Participar:',
                    'value': `${arrow} Basta reajir com 🎉`,
                    'inline': true
                }
            ]).setFooter(`Bot Desenvolvidor por - ramon#5522`)

            if (rules != 'pular') {
                embed.addField('> Regras do sorteio:', rules, true)
                embed.addField('\u200B', '\u200B', true)
            }

            await message.channel.send(embed)

            let questionEmbed = new Discord.MessageEmbed()
                .setColor(this.client.config.color)
                .setTitle(`Sorteio`)
                .setDescription('> Deseja realmente realizar esté sorteio?')

            let question = await message.channel.send(questionEmbed)
            await question.react('✅')
            await question.react('❌')

            question.awaitReactions((reaction, user) =>
                user.id === message.author.id
                , { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    if (collected.first().emoji.name == '✅') {
                        let endTime = moment().tz('America/Sao_Paulo').add(duration, 'm')
                        let data = endTime.format('DD/MM/YYYY')
                        let hours = endTime.format('HH:mm:ss')
                        embed.addField('> Data de finalização:', `➔ Dia ${data} ás ${hours}`, true)
                        channelGiveaway.send(embed).then(message => {
                            message.react('🎉')
                            const timeout = setTimeout(() => {
                                this.giveaway(message.id)
                            }, (60000 * duration))
                            queue.giveaway.set(message.id, { message, status: 0, channel: channelGiveaway, timeout, title, description, thumbmail, image, totalWinners, endTime, participants: [] })
                        }).catch(error => this.sendEmbed(channel, 'Error', 'Não foi possivel criar o sorteio.'))
                    }
                })
                .catch(collected => {
                    this.sendEmbed(channel, 'Error', 'Seu tempo expirou')
                })
        } catch (error) {
            console.log(error)
            this.sendEmbed(channel, 'Error', 'Seu tempo expirou')
        }
    }
}

module.exports = Sorteio
