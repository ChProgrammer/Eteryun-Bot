const Command = require('../strucutres/Command')
const queue = require('../utils/Queue')
const ytdl = require('ytdl-core')

class Mute extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = false
        this.category = 'Diversão'
        this.description = 'Tocar ou adicionar uma música a fila de espera.'
        this.usage = ['url/nome']
        this.clientPermissions = ['CONNECT', 'SPEAK']
    }

    play(guild, song) {
        const serverQueue = queue.playlist.get(guild.id)
        if (!song) {
            serverQueue.voiceChannel.leave()
            queue.playlist.delete(guild.id)
            return
        }
        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on('finish', () => {
                serverQueue.songs.shift()
                this.play(guild, serverQueue.songs[0])
            })
            .on('error', error => console.log(error))

        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
        this.sendEmbed(serverQueue.textChannel, `Tocando: **${song.title}**`)
    }

    async run(message, args, { prefix }) {
        const channel = message.channel
        const serverQueue = queue.playlist.get(message.guild.id)
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel)
            return this.sendEmbed(channel, 'Você precisa estar em um canal de voz para tocar música!')

        const permissions = voiceChannel.permissionsFor(message.client.user)
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK'))
            return this.sendEmbed(channel, 'Preciso das permissões para entrar e falar no seu canal de voz!')

        if (args.length) {
            const songInfo = await ytdl.getInfo(args[0])
            const song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url }
            if (serverQueue) {
                serverQueue.songs.push(song)
                this.sendEmbed(channel, `${song.title} foi adicionado à fila!`)
            } else {
                const queueContruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true,
                }
                queue.playlist.set(message.guild.id, queueContruct)
                queueContruct.songs.push(song)
                try {
                    const connection = await voiceChannel.join()
                    queueContruct.connection = connection
                    this.play(message.guild, queueContruct.songs[0])
                } catch (error) {
                    console.log(error)
                    queue.delete(message.guild.id)
                    this.sendEmbed(channel, `Não foi possivel conectar ao canal.`)
                }
            }
        } else {
            if (serverQueue) {
                serverQueue.connection.dispatcher.resume()
            } else {
                this.sendEmbed(channel, `Não há nenhuma música para tocar.`)
            }
        }
    }
}

module.exports = Mute