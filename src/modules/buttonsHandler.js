let {dbObj} = require('./message_listener')
const skipButton = require('./functions/skipButton')

function handler(interaction) {
  if (dbObj[interaction.guildId].channel == interaction.channelId) {
    switch (interaction.customId) {
      case 'play_pause':
        skipButton(interaction)
        break

      case 'skip_song':
        skipButton(interaction)
        break

      case 'stop_song':
        skipButton(interaction)
        break

      case 'shuffle_song':
        skipButton(interaction)
        break

      case 'repeat_song':
        skipButton(interaction)
        break

      default:
        break
    }
  } else {
    interaction.reply({content: 'Ten kanał nie jest aktywny!', ephemeral: true})
  }
}

module.exports = handler
