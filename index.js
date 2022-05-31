const Discord = require('discord.js')
const dotenv = require('dotenv')
const {Player} = require('discord-player')
const loaderSlashes = require('./src/utils/loadSlash.js')
const db = require('./src/utils/database.js')
dotenv.config()
const TOKEN = process.env.TOKEN

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_VOICE_STATES'],
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
})

client.on('ready', () => {
  loaderSlashes(client)
  console.log(`Zalogowany jako: ${client.user.tag}`)
})

client.on('interactionCreate', (interaction) => {
  async function handleCommand() {
    if (!interaction.isCommand()) return

    const slashcmd = client.slashcommands.get(interaction.commandName)
    if (!slashcmd) interaction.reply('Błędna komenda')

    await interaction.deferReply({ephemeral: true})
    await slashcmd.run({client, interaction, db})
  }
  handleCommand()
})

client.login(TOKEN)
