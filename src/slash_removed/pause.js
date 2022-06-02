const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Wstrzymuje odtwarzanie muzyki'),
  run: async ({client, interaction}) => {
    const queue = client.player.getQueue(interaction.guildId)

    if (!queue) return await interaction.editReply('Brak piosenek w kolejce')

    queue.setPaused(true)
    await interaction.editReply(
      'Muzyka została zapauzowana! Uzyj `/resume` aby wznowić odtwarzanie',
    )
  },
}
