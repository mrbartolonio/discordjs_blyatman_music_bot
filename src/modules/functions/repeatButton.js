const {MessageEmbed} = require('discord.js')
const {updateEmbed} = require('../embedupdater')

async function repeatButton(interaction, player) {
  const queue = player.getQueue(interaction.guildId)
  if (!queue) {
    await interaction.reply({
      embeds: [
        new MessageEmbed()
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
    await queue.setRepeatMode(queue.repeatMode == 3 ? 0 : queue.repeatMode + 1)
    await interaction.deferUpdate()
    await updateEmbed(queue)
  }
}

module.exports = repeatButton
