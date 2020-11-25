const Command = require('../strucutres/Command')

class Say extends Command {
    constructor(client) {
        super(client)
        this.requiredArgs = true
        this.category = 'Dono'
        this.description = 'Mandar uma mensagem usando o bot.'
        this.usage = ['mensagem']
        this.permissions = ['ADMINISTRATOR']
    }

    async run(message, args, { prefix }) {
        let sayMessage = args.join(" ");
        message.delete()
        message.channel.send(sayMessage)
    }
}

module.exports = Say