let {dbObj} = require('./message_listener')
const skipButton = require('./functions/skipButton')
const stopButton = require('./functions/stopbutton')
const playPauseButton = require('./functions/playPauseButton')
const shuffleButton = require('./functions/shuffleButton')
const repeatButton = require('./functions/repeatButton')

async function handler(interaction, player, client) {
  if (dbObj[interaction.guildId].channel == interaction.channelId) {
    switch (interaction.customId) {
      case 'play_pause':
        playPauseButton(interaction, player, client)
        break

      case 'skip_song':
        skipButton(interaction, player, client)
        break

      case 'stop_song':
        stopButton(interaction, player, client.channels)
        break

      case 'shuffle_song':
        shuffleButton(interaction, player, client)
        break

      case 'repeat_song':
        repeatButton(interaction, player, client)
        break

      default:
        break
    }
  } else {
    interaction.reply({content: 'Ten kanał nie jest aktywny!', ephemeral: true})
  }
}

module.exports = handler
