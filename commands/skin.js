const Command = require('../strucutres/Command')
const axios = require('axios')
const Discord = require('discord.js')

class Skin extends Command {
    constructor(client) {
        super(client)
        this.requiredArgs = true
        this.category = 'Diversão'
        this.description = 'Mudar status do bot.'
        this.usage = ['nome <render> <overlay>']
    }

    async run(message, args, { prefix }) {
        const channel = message.channel
        let name = args[0]
        let render = args[1]
        let overlay = args[2]
        let urlProfile = `https://api.mojang.com/users/profiles/minecraft/${name}`
        let uuid
        try {
            const response = await axios.get(urlProfile)
            uuid = response.data.id
        } catch (error) {
            return this.sendEmbed(channel, '', `Não foi possivel encontrar a skin de ${name}`)
        }

        try {
            let url = render ? `https://crafatar.com/renders/body/${uuid}?${overlay && 'overlay'}` : `https://crafatar.com/skins/${uuid}`
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            })
            const attachment = new Discord.MessageAttachment(Buffer.from(response.data, 'binary'), 'skin.png')
            channel.send(attachment)
        } catch (error) {
            console.log(error)
            return this.sendEmbed(channel, '', `Não foi possivel encontrar a skin de ${name}`)
        }
    }
}

module.exports = Skin