const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Wymieszaj kolejkę'),
  run: async ({client, interaction}) => {
    const queue = client.player.getQueue(interaction.guildId)

    if (!queue) return await interaction.editReply('Brak piosenek w kolejce')

    queue.shuffle()
    await interaction.editReply(
      `Kolejka zawierająca ${queue.tracks.length} piosenek została wymieszana!`,
    )
  },
}
