const Command = require('../strucutres/Command')

class Status extends Command {
    constructor(client) {
        super(client)
        this.requiredArgs = true
        this.category = 'Dono'
        this.description = 'Mudar status do bot.'
        this.usage = ['status']
        this.permissions = ['ADMINISTRATOR']
    }

    async run(message, args, { prefix }) {
        let status_string = args.join(" ");
        this.client.user.setPresence({ status: 'online', activity: { name: status_string } })
    }
}

module.exports = Status