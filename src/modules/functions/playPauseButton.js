const {EmbedBuilder} = require('discord.js')
const {updateEmbed} = require('../embedupdater')

async function playPauseButton(interaction, player) {
  const queue = player.getQueue(interaction.guildId)
  if (!queue) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`Brak piosenek w kolejce!`)
          .setFooter({
            text: `${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    })
    setTimeout(() => {
      interaction.deleteReply()
    }, 5000)
  } else {
    await queue.setPaused(!queue.connection.paused)
    await interaction.deferUpdate()
    await updateEmbed(queue)
  }
}

module.exports = playPauseButton
