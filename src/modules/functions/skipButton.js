const {MessageEmbed} = require('discord.js')
const {updateEmbed} = require('../embedupdater')

async function skipButton(interaction, player) {
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
    const currentSong = queue.current

    await queue.skip()
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setDescription(`${currentSong.title} pominięto!`)
          .setThumbnail(currentSong.thumbnail)
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
    await updateEmbed(queue)
  }
}

module.exports = skipButton
