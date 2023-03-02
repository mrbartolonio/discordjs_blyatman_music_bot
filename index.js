const {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
  REST,
  Routes,
} = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const db = require('./src/utils/database.js')
const loaderSlashes = require('./src/utils/loadSlash.js')
const {DisTube} = require('distube')
const {SpotifyPlugin} = require('@distube/spotify')

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
client.distube = new DisTube(client, {
  leaveOnFinish: true,
  leaveOnEmpty: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new SpotifyPlugin({
      emitEventsAfterFetching: true,
    }),
  ],
})

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
    await slashcmd.run({client, interaction})
  }
  handleCommand()
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
    status: 'idle',
  })
  console.log('update presence')
}

module.exports = updateStatus
