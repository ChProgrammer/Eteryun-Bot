const Command = require('../strucutres/Command')
const recipes = require('../utils/mc/recipes.json')
const items = require('../utils/mc/items.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const levenshtein = require('js-levenshtein')
const minecraftItems = require('minecraft-items')

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

class Recipe extends Command {
    constructor(client) {
        super(client)
        this.guildOnly = true
        this.requiredArgs = true
        this.category = 'Diversão'
        this.description = 'Despausar a música atual'
        this.usage = 'item'
    }

    getMoreLike(string, array) {
        let lastValue = 1000
        let moreLike
        array = array.filter(item => item.displayName.toLocaleLowerCase().startsWith(string.slice(0, 3)))
        array.forEach(item => {
            let difference = levenshtein(string, item.displayName.toLocaleLowerCase())
            if (difference < lastValue) {
                lastValue = difference
                moreLike = item
            }
        })
        return moreLike
    }

    async run(message, args, { prefix }) {
        const channel = message.channel
        const name = args.join(' ').toLocaleLowerCase()
        const item = items.find(item => item.displayName.toLocaleLowerCase() == name)

        if (!item && name.length < 3)
            return this.sendEmbed(channel, '', 'Nenhum item encontrado com esse nome')

        let moreLike = this.getMoreLike(name, items)
        if (!item && moreLike)
            return this.sendEmbed(channel, '', `Talvez você queira dizer: **${moreLike.displayName}**`)
        else if (!item)
            return this.sendEmbed(channel, '', 'Nenhum item encontrado com esse nome')

        let recipe = recipes[item.id][0]

        if (!recipe.inShape)
            return this.sendEmbed(channel, '', `Não foi possivel encontrar nenhuma recipe para **${item.displayName}**`)

        recipe = recipe.inShape.map(layer => layer.map(id => items.find(item => item.id === id)))
        recipe = recipe.reverse()

        const canvas = Canvas.createCanvas(260, 136)
        const ctx = canvas.getContext('2d')
        const background = await Canvas.loadImage('./utils/mc/images/crafting.png')
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
        const result = await Canvas.loadImage(`data:image/png;base64,${minecraftItems.get(item.displayName).icon}`)
        ctx.drawImage(result, 203, 52, 32, 32)

        await asyncForEach(recipe, async (_, line) => {
            line = (line * 2) + 1
            await asyncForEach(_, async (item, slot) => {
                slot = (slot * 2) + 1
                if (item) {
                    let icon = `data:image/png;base64,${minecraftItems.get(item.displayName).icon}`
                    let texture = await Canvas.loadImage(icon)
                    ctx.drawImage(texture, 18 * slot, 18 * line, 28, 28)
                }
            })
        })

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'background.png')
        channel.send(attachment)
    }
}

module.exports = Recipe