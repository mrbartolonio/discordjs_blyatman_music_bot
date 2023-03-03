/* eslint-disable no-case-declarations */
const {EmbedBuilder, SlashCommandBuilder} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('przewin')
    .setDescription('Przewiń utwór')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('przod')
        .setDescription('Przewiń do przodu')
        .addIntegerOption((option) =>
          option
            .setName('sekundy_p')
            .setDescription('Czas w sekundach do przewinięcia (10=10s)')
            .setMinValue(1)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('tyl')
        .setDescription('Przewiń do tyłu')
        .addIntegerOption((option) =>
          option
            .setName('sekundy_t')
            .setDescription('Czas w sekundach do przewinięcia (10=10s)')
            .setMinValue(1)
            .setRequired(true),
        ),
    ),

  run: async ({client, interaction}) => {
    const {options, member, guild} = interaction
    const subcommand = options.getSubcommand()
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
      switch (subcommand) {
        case 'przod':
          const sec_p = options.getInteger('sekundy_p')
          await queue.seek(queue.currentTime + sec_p)
          embed
            .setColor('Blue')
            .setDescription(`Przewinięto piosenkę o \`${sec_p}\` sekund`)
          return interaction.reply({embeds: [embed], ephemeral: true})

        case 'tyl':
          const sec_t = options.getInteger('sekundy_t')
          await queue.seek(queue.currentTime - sec_p)
          embed
            .setColor('Blue')
            .setDescription(`Przewinięto piosenkę o \`${sec_t}\` sekund`)
          return interaction.reply({embeds: [embed], ephemeral: true})
      }
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription(error.message)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
  },
}
