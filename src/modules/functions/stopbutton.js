const {EmbedBuilder} = require('discord.js')
const {setDefEmbed} = require('../embedupdater')

async function stopButton(interaction, player, channels) {
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
    setTimeout(async () => {
      await interaction.deleteReply()
    }, 5000)
  } else {
    await queue.clear()
    await queue.destroy()
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`Zatrzymano kolejkę`)
          .setTimestamp()
          .setFooter({
            text: `${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          }),
      ],
    })
    await setDefEmbed(queue, channels)
    setTimeout(async () => {
      await interaction.deleteReply()
    }, 5000)
  }
}

module.exports = stopButton
