const Command = require('../strucutres/Command')
const queue = require('../utils/Queue')
const ytdl = require('ytdl-core')

class Mute extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = true
        this.category = 'Diversão'
        this.description = 'Setar volume da música.'
        this.usage = ['100']
        this.clientPermissions = ['CONNECT', 'SPEAK']
        this.permissions = ['ADMINISTRATOR']
    }

    async run(message, args, { prefix }) {
        const channel = message.channel
        const serverQueue = queue.playlist.get(message.guild.id)
        const voiceChannel = message.member.voice.channel

        if (!voiceChannel)
            return this.sendEmbed(channel, 'Você tem que estar em um canal de voz para parar a música!')

        const volume = parseFloat(args[0])
        if (isNaN(volume))
            return message.channel.send(this.getUsage(prefix, true))

        volume = volume / 100 > 1 ? 1 : volume / 100
        serverQueue.connection.dispatcher.setVolume(volume)
        this.sendEmbed(channel, `Volume da música setado para ${volume}`)
    }
}

module.exports = Mute