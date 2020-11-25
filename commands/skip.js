const Command = require('../strucutres/Command')
const queue = require('../utils/Queue')

class Skip extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.category = 'Diversão'
        this.description = 'Pular a música atual'
        this.clientPermissions = ['CONNECT', 'SPEAK']
    }

    async run(message, args, { prefix }) {
        const channel = message.channel
        const serverQueue = queue.playlist.get(message.guild.id)
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel)
            return this.sendEmbed(channel, 'Você tem que estar em um canal de voz para pular a música!')
        if (serverQueue.songs.length == 0)
            return this.sendEmbed(channel, 'Não há música que eu possa pular!')

        serverQueue.connection.dispatcher.end()
    }
}

module.exports = Skip