const {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
} = require('discord.js')

const dotenv = require('dotenv')
//const db = require('./src/utils/database.js')
const loaderSlashes = require('./src/utils/loadSlash.js')
const {registerPlayerEvents} = require('./src/utils/events.js')
const {Player} = require('discord-player')

dotenv.config()
const TOKEN = process.env.TOKEN

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})
client.slashcommands = new Collection()
client.player = new Player(client, {
  ytdlOptions: {
    requestOptions: {
      headers: {
        cookie: process.env.COOKIE_YT,
      },
    },
  },
})

registerPlayerEvents(client.player)

client.on('guildCreate', (guild) => {
  console.log('Joined a new guild: ' + guild.name)
  loaderSlashes(client, guild.id)
})

client.on('ready', () => {
  loaderSlashes(client)
  updateStatus()
  console.log(`Zalogowany jako: ${client.user.tag}`)
})

client.on('interactionCreate', (interaction) => {
  async function handleCommand() {
    if (!interaction.isCommand()) return

    const slashcmd = client.slashcommands.get(interaction.commandName)
    if (!slashcmd) interaction.reply('Błędna komenda')

    //  await interaction.deferReply({ephemeral: true})
    await slashcmd.execute({client, interaction})
  }

  async function handleAutocomplete() {
    if (!interaction.isAutocomplete()) return

    const slashcmd = client.slashcommands.get(interaction.commandName)
    if (!slashcmd) interaction.reply('Błędna komenda')

    //  await interaction.deferReply({ephemeral: true})
    await slashcmd.autocomplete({client, interaction})
  }

  handleCommand()
  handleAutocomplete()
})

client.login(TOKEN)

function updateStatus() {
  client.user.setPresence({
    activities: [
      {
        name: `🎶 | Buja na: ${client.guilds.cache.size} serwerach`,
        type: ActivityType.Listening,
      },
    ],
  })
  console.log('update presence')
}

module.exports = updateStatus
