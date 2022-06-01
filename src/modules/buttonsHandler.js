let {dbObj} = require('./message_listener')

function handler(interaction) {
  if (dbObj[interaction.guildId].channel == interaction.channelId) {
    switch (interaction.customId) {
      case 'value':
        //Buttony tutaj ogarnac
        break

      default:
        break
    }
  } else {
    interaction.reply({content: 'Ten kanał nie jest aktywny!', ephemeral: true})
  }
}

module.exports = handler
