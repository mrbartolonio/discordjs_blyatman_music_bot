const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pomija bieżący utwór'),
  run: async ({client, interaction}) => {
    const queue = client.player.getQueue(interaction.guildId)

    if (!queue) return await interaction.editReply('Brak piosenek w kolejce')

    const currentSong = queue.current

    queue.skip()
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setDescription(`${currentSong.title} zostało pominięte!`)
          .setThumbnail(currentSong.thumbnail),
      ],
    })
  },
}
