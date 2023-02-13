const {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
} = require('discord.js')
const dotenv = require('dotenv')
const {Player} = require('discord-player')
const loaderSlashes = require('./src/utils/loadSlash.js')
const prisma = require('./src/utils/database.js')
const {messListener} = require('./src/modules/message_listener.js')
const {updater} = require('./src/modules/embedupdater.js')
const btnHandl = require('./src/modules/buttonsHandler.js')

dotenv.config()
const TOKEN = process.env.TOKEN

/* const client = new Client({
  intents: ['GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES'],
})
 */
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
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
})
client.on('guildCreate', (guild) => {
  console.log('Joined a new guild: ' + guild.name)
  loaderSlashes(client, guild.id)
})
client.on('ready', () => {
  /*   client.user.setActivity(`Buja na: ${client.guilds.cache.size} serwerach`, {
    type: 'LISTENING',
  }) */
  updateStatus()
  /*   client.user.setActivity({
    name: '🎶 | Rozkręcamy tą imprezę!',
    type: 'LISTENING',
  }) */
  loaderSlashes(client)
  console.log(`Zalogowany jako: ${client.user.tag}`)
})

client.on('interactionCreate', (interaction) => {
  async function handleButton() {
    if (!interaction.isButton()) return
    await btnHandl(interaction, client.player, client)
  }

  async function handleCommand() {
    if (!interaction.isCommand()) return

    const slashcmd = client.slashcommands.get(interaction.commandName)
    if (!slashcmd) interaction.reply('Błędna komenda')

    await interaction.deferReply({ephemeral: true})
    await slashcmd.run({client, interaction, prisma})
  }
  handleCommand()
  handleButton()
})
updater(client, client.player, client.channels)
messListener(client)

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
