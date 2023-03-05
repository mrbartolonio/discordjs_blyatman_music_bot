/* eslint-disable no-case-declarations */
const {EmbedBuilder, SlashCommandBuilder} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('petla')
    .setDescription('Wyświetla typy pętli')
    .addStringOption((option) =>
      option
        .setName('typ')
        .setDescription('Dostępne typy pętli: OFF | Piosenka | Kolejka')
        .addChoices(
          {name: 'off', value: 'off'},
          {name: 'piosenka', value: 'song'},
          {name: 'kolejka', value: 'queue'},
        )
        .setRequired(true),
    ),

  run: async ({client, interaction}) => {
    const {options, member, guild} = interaction
    const option = options.getString('typ')
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
      let mode = null
      switch (option) {
        case 'off':
          mode = 0
          break

        case 'song':
          mode = 1
          break

        case 'queue':
          mode = 2
          break
      }

      mode = await queue.setRepeatMode(mode)
      mode = mode
        ? mode === 2
          ? 'Powtarzanie kolejki'
          : 'Powtarzanie piosenki'
        : 'OFF'
      embed.setColor('Orange').setDescription(`Ustawion tryb pętli na: ${mode}`)
      return interaction.reply({embeds: [embed], ephemeral: true})
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription(error.message)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
  },
}
