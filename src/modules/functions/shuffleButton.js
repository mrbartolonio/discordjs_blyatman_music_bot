const {MessageEmbed} = require('discord.js')
const {updateEmbed} = require('../embedupdater')

async function shuffleButton(interaction, player) {
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
    await queue.shuffle()
    await interaction.deferUpdate()
    await updateEmbed(queue)
  }
}

module.exports = shuffleButton
