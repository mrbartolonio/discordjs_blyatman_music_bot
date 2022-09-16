const {EmbedBuilder} = require('discord.js')
const {updateEmbed} = require('../embedupdater')

async function skipButton(interaction, player) {
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
    const currentSong = queue.current

    await queue.skip()

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${currentSong.title} pominięto!`)
          .setThumbnail(currentSong.thumbnail)
          .setTimestamp()
          .setFooter({
            text: `${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          }),
      ],
    })
    await updateEmbed(queue)
    setTimeout(async () => {
      await interaction.deleteReply()
    }, 5000)
  }
}

module.exports = skipButton
