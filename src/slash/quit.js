const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Zatrzymuje odtwarzanie'),
  run: async ({client, interaction}) => {
    const queue = client.player.getQueue(interaction.guildId)

    if (!queue) return await interaction.editReply('Brak piosenek w kolejce')

    queue.clear()
    queue.destroy()
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setImage('https://i.giphy.com/media/w89ak63KNl0nJl80ig/giphy.gif')
          .setDescription('Naura'),
      ],
    })
  },
}
