const Command = require('../strucutres/Command')
const queue = require('../utils/Queue')
const ytdl = require('ytdl-core')

class Mute extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = false
        this.category = 'Diversão'
        this.description = 'Para a música e limpar fila de espera.'
        this.clientPermissions = ['CONNECT', 'SPEAK']
    }

    async run(message, args, { prefix }) {
        const channel = message.channel
        const serverQueue = queue.playlist.get(message.guild.id)
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel)
            return this.sendEmbed(channel, 'Você tem que estar em um canal de voz para parar a música!')

        serverQueue.songs = []
        serverQueue.connection.dispatcher.end()
    }
}

module.exports = Mute