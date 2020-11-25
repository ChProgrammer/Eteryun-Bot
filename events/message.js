module.exports = async function onMessage(message) {
  // Get 
  const mentionClient = (message.guild ? message.guild.me.toString() : this.user.toString()) + ' '
  const prefix = message.content.startsWith(mentionClient) ? mentionClient : (this.config.prefix && message.content.startsWith(this.config.prefix)) ? this.config.prefix : null
  if (message.content.includes('discord.gg/' || 'discordapp.com/invite/' || 'discord.me')) return message.delete()

  let channel = this.config.channels.sugestions.make.find(item => item == message.channel.id)
  // message.channel.id == this.config.channels.sugestions.make
  if (channel && !message.content.startsWith('^') && message.author.id != this.user.id) {
    await message.react('✔️')
    return await message.react('❌')
  }

  if (!prefix || message.author.bot) return

  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const commandName = args.shift().toLowerCase()
  const command = this.commands.find((c, i) => i === commandName || c.aliases.includes(commandName))

  if (command) {
    console.log(`${message.author.username} (${message.author.id}) executou o comando: ${command.name}`)
    await command._run(message, args, { prefix })
  }
}