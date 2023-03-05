/* eslint-disable no-case-declarations */
const {EmbedBuilder, SlashCommandBuilder} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('mix')
    .setDescription('Mixuje kolejność utworów w kolejce'),

  run: async ({client, interaction}) => {
    const {member, guild} = interaction

    const voiceChannel = member.voice.channel
    const embed = new EmbedBuilder()

    if (!voiceChannel) {
      embed
        .setColor('Red')
        .setDescription(
          'Musisz przebywać na kanale głosowym aby używać komend związanych z botem',
        )
      return interaction.reply({embeds: [embed], ephemeral: true})
    }

    if (!member.voice.channelId == guild.members.me.voice.channelId) {
      embed
        .setColor('Red')
        .setDescription(
          `Nie możesz używać odtwarza jeżeli działa na innym kanale <#${guild.members.me.voice.channelId}>`,
        )
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
    const queue = await client.distube.getQueue(voiceChannel)

    if (!queue) {
      embed.setColor('Red').setDescription(`Brak aktywnej kolejki odtwarzania`)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
    try {
      await queue.shuffle()
      embed.setColor('Purple').setDescription(`Kolejka została zmixowana`)

      return interaction.reply({embeds: [embed], ephemeral: true})
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription(error.message)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
  },
}
