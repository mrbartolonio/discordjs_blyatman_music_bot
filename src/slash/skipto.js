const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Pomija utwory do numeru #')
    .addNumberOption((option) =>
      option
        .setName('tracknumber')
        .setDescription('Numer piosenki do odtworzenia')
        .setMinValue(1)
        .setRequired(true),
    ),
  run: async ({client, interaction}) => {
    const queue = client.player.getQueue(interaction.guildId)

    if (!queue) return await interaction.editReply('Brak piosenek w kolejce')

    const trackNum = interaction.options.getNumber('tracknumber')
    if (trackNum > queue.tracks.length)
      return await interaction.editReply('Błędny numer piosenki')
    queue.skipTo(trackNum - 1)

    await interaction.editReply(`Pominięto do utworu numer ${trackNum}`)
  },
}
