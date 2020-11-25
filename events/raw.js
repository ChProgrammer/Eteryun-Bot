const queue = require('../utils/Queue')
const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

module.exports = async function onraw(event) {
    if (event.t === 'MESSAGE_REACTION_ADD') {

        if (event.d.user_id == this.user.id)
            return

        const guild = this.guilds.cache.get(event.d.guild_id)
        const member = guild.members.cache.get(event.d.user_id)
        const channel = this.channels.cache.get(event.d.channel_id)
        console.log(this.config.channels.sugestions.make.find(item => item == event.d.channel_id))

        if (event.d.emoji.name == 'eteryun') {
            if (queue.giveaway.has(event.d.message_id)) {
                const giveaway = queue.giveaway.get(event.d.message_id)
                giveaway.participants.push(member)
                queue.giveaway.set(event.d.message_id, giveaway)
            }
        } else if (event.d.emoji.name == '🔒') {
            let forum = null
            queue.forum.forEach(item => {
                if (item.messageClose.id == event.d.message_id && item.channel.id == channel.id)
                    forum = item
            })
            if (forum) {
                if (hasPerm(member, this.config.forum.rolesToMark)) {
                    let logText = 'Canal criado em: '

                    logText += channel.createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false }).replace(',', ' -') + '\n\n'
                    await channel.messages.cache.map(msg => {
                        if (msg && msg.content && msg.author && !msg.author.bot) {
                            logText += `${msg.createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false }).replace(',', ' -')}| ${msg.author.username}: ${msg.content}\n`
                        }
                    })

                    logText += `\nCanal excluido em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false }).replace(",", " -")}`
                    const logPath = path.join(__dirname, '..', 'logs')

                    if (!fs.existsSync(logPath)) {
                        await fs.mkdirSync(logPath)
                    }

                    await fs.writeFileSync(path.join(logPath, 'log.txt'), logText, (err) => { if (err) throw err })

                    const channelLog = guild.channels.cache.get(this.config.channels.forum.log)

                    channelLog.send(`\`#${channel.name}\` foi fechado por: ${member.user}`, {
                        files: [{
                            attachment: path.join(logPath, 'log.txt'),
                            name: `#${channel.name}_log.txt`
                        }]
                    })

                    await channel.delete()

                    queue.forum.delete(forum.author)

                }
            }
        } else if (this.config.channels.sugestions.make.find(item => item == event.d.channel_id)) {
            const message = await channel.messages.fetch(event.d.message_id)
            const aproves = message.reactions.cache.find(r => r.emoji.name == '✔️')
            const rejects = message.reactions.cache.find(r => r.emoji.name == '❌')
            if (aproves && rejects) {
                const total = aproves.count + rejects.count - 2
                console.log("Coletados " + total + " reações da mensagem de id " + event.d.message_id)
                if (total >= this.config.sugestions.minVote) {
                    let sub = total - (rejects.count - 1)
                    let percentAproves = (sub / total) * 100
                    if (percentAproves >= this.config.sugestions.minPercentagem) {
                        const adminsugestionchannel = guild.channels.cache.get(this.config.channels.sugestions.admin)
                        const embed = new Discord.MessageEmbed()
                            .setColor(this.config.color)
                            .addField('**Sugestão**', message.content)
                            .setFooter(`Enviado por ${message.member.user.tag}`)
                        adminsugestionchannel.send(embed)
                        message.delete([1000])

                        embed.setTitle('Sugestão Aprovada')
                        channel.send(embed)
                    }
                }
            }

        } else if (this.config.channels.forum.open == event.d.channel_id) {
            const rolesToMark = this.config.forum.rolesToMark
            const categoryId = this.config.forum.category

            if (queue.forum.has(member)) return member.send(new Discord.MessageEmbed()
                .setDescription('Você já tem um forum aberto. Ele deve ser resolvido para que você possa abrir outro!'))

            const permissions = rolesToMark.map(id => ({ type: 'role', allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'], id }))

            const newChannel = await guild.channels.create(`forum-${member.user.username}`, {
                parent: categoryId,
                permissionOverwrites: [
                    { deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'], id: guild.id },
                    { allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'], id: member.user.id },
                    ...permissions
                ]
            })

            let text = ''
            rolesToMark.forEach(id => {
                text += `<@&${id}>\n`
            })

            const msg = await newChannel.send(text)
            msg.delete()

            const embed = new Discord.MessageEmbed()
                .setColor(this.config.color)
                .setAuthor(member.user.username, member.user.displayAvatarURL())
                .setDescription(`**-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=++=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**\n${member.user}\nDeixe sua dúvida abaixo que assim que possivel algum staff irá lhe responder!\n**-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=++=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**`)
                .setFooter(this.user.username, this.user.displayAvatarURL())

            const msgEmbed = await newChannel.send(embed)

            queue.forum.set(member, { channel: newChannel, messageClose: msgEmbed, author: member })

            await msgEmbed.react('🔒')

        } else if (this.config.channels.tags.admin == event.d.channel_id) {
            const message = await channel.messages.fetch(event.d.message_id)
            let accept = false
            let match = message.embeds[0].description.match(/Usuário: <(?:[^\d>]+|:[A-Za-z0-9]+:)\w+>/g)[0]
            match = match.replace('Usuário: <@', '').replace('>', '')
            const memberRequest = guild.members.cache.get(match)
            
            let request = queue.requestRole.get(match)

            if (request) {
                if (event.d.emoji.name == '✅')
                    accept = true
                await message.delete()

                if (accept)
                    await memberRequest.roles.add(request.role.roles)

                const tagResponse = this.channels.cache.get(this.config.channels.tags.response)
                const role = guild.roles.cache.get(request.role.id)
                tagResponse.send(new Discord.MessageEmbed()
                    .setDescription(`${event.d.emoji.name} | ${memberRequest} a sua solicitação para o cargo ${role} foi ${accept ? 'aceito' : 'negado'} por ${member.user}`)
                    .setTimestamp())

                queue.requestRole.delete(match)
            }
        }

        if (this.config.channels.tags.request == event.d.channel_id) {
            const message = await channel.messages.fetch(this.config.tagsrequest.messageId)
            const userReactions = message.reactions.cache.filter(r => r.users.cache.has(event.d.user_id))

            try {
                for (const reaction of userReactions.values()) {
                    await reaction.users.remove(event.d.user_id)
                }
            } catch (erro) {
                console.log(erro)
            }


            const emojis = this.config.tagsrequest.tags
            let isHave = false
            let role = ''

            emojis.forEach(async item => {
                if (event.d.emoji.name == item.emoji) {
                    if (member.roles.cache.find(r => r.id == item.id))
                        isHave = true
                    role = item
                }
                await message.react(item.emoji)
            })

            await member.createDM()
            if (isHave)
                return member.send(new Discord.MessageEmbed()
                    .setDescription(`❌ | Opa, parece que você está solicitando um cargo que já possuí!`))

            if (queue.cooldown.has(member.user.id))
                return member.send(new Discord.MessageEmbed()
                    .setDescription(`❌ | Acabe de fazer a solicitação de um cargo, finalize está outra solicitação`))

            queue.cooldown.add(member.user.id)

            const messageSended = await member.send(new Discord.MessageEmbed()
                .setDescription(`Olá, ${member.user.username}.\n\nNos envie seu portfólio para que o possamos avaliar enquanto ${role.name}.`)
                .setFooter(`Atenciosamente, Equipe do ${guild.name}`)
                .setColor('RANDOM'))

            let messageCollector = messageSended.channel.createMessageCollector((message) => message.author.id === member.user.id, { time: 120000, max: 1 })
            let coleted = false

            messageCollector.on('collect', async p => {
                coleted = true
                queue.cooldown.delete(member.user.id)
                let portfolio = p.content
                let channelAdmin = this.channels.cache.get(this.config.channels.tags.admin)
                let messageAdmin = await channelAdmin.send(new Discord.MessageEmbed()
                    .setTitle(`NOVA SOLICITAÇÃO DE TAG`)
                    .setDescription(`A tag ${role.name} foi solicitada por um usuário.\n\nUsuário: ${member.user}\n\nPortefólio: ${portfolio}`)
                    .setTimestamp())

                await messageAdmin.react('✅').then(async () => {
                    messageAdmin.react('❌')
                })

                queue.requestRole.set(member.user.id, { role: role, message: messageAdmin })
            })
            setTimeout(async () => {
                if (coleted === false) {
                    queue.cooldown.delete(member.user.id)
                }

                messageSended.edit(new Discord.MessageEmbed()
                    .setDescription(`❌ | Opa, parece que o tempo para enviar o portefólio acabou reaja novamente!`))
            }, 120000)
        }
    }
}

async function hasPerm(member, rolesIDs) {
    rolesIDs.map((id) => {
        if (member.roles.cache.has(id)) {
            return true
        }
    })
    return false
}