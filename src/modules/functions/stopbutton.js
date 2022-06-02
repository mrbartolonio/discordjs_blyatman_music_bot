const {MessageEmbed} = require('discord.js')
const {setDefEmbed} = require('../embedupdater')

async function stopButton(interaction, player, channels) {
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
    await setDefEmbed(queue, channels)
    queue.clear()
    queue.destroy()
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setDescription(`Zatrzymano kolejkę`)
          .setTimestamp()
          .setFooter({
            text: `${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          }),
      ],
    })
    setTimeout(() => {
      interaction.deleteReply()
    }, 5000)
  }
}

module.exports = stopButton
