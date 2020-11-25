module.exports = function onReady() {
    console.log(`Bot iniciado com ${this.users.cache.size} membros em ${this.guilds.cache.size} servidores`)
    this.user.setPresence({status: 'online', activity: { name: this.config.status }})
}