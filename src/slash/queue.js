const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Wyświetlanie informacji na temat aktualnej kolejki')
    .addNumberOption((option) =>
      option
        .setName('page')
        .setDescription('Numer strony kolejki')
        .setMinValue(1),
    ),

  run: async ({client, interaction}) => {
    const queue = client.player.getQueue(interaction.guildId)
    if (!queue || !queue.playing) {
      return await interaction.editReply('Brak piosenek w kolejce')
    }

    const totalPages = Math.ceil(queue.tracks.length / 10) || 1
    const page = (interaction.options.getNumber('page') || 1) - 1

    if (page > totalPages)
      return await interaction.editReply(
        `Błędna strona. Dostępne jest ${totalPages} stron z piosenkami`,
      )

    const queueString = queue.tracks
      .slice(page * 10, page * 10 + 10)
      .map((song, i) => {
        return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${
          song.title
        } -- <@${song.requestedBy.id}>`
      })
      .join('\n')

    const currentSong = queue.current

    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `**Teraz Odtwarzane**\n` +
              (currentSong
                ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>`
                : 'Nic') +
              `\n\n**Kolejka**\n${queueString}`,
          )
          .setFooter({
            text: `Strona ${page + 1} z ${totalPages}`,
          })
          .setThumbnail(currentSong.setThumbnail),
      ],
    })
  },
}
