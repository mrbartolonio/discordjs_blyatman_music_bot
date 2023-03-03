const {EmbedBuilder, SlashCommandBuilder} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ustaw głośność odtwarzania')
    .addIntegerOption((option) =>
      option
        .setName('procenty')
        .setDescription('50=50%')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    ),

  run: async ({client, interaction}) => {
    const {options, member, guild} = interaction

    const volume = options.getInteger('procenty')
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

    try {
      await client.distube.setVolume(voiceChannel, volume)
      return interaction.reply({
        content: `🔊 Głośność ustawiono na: ${volume}%`,
      })
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription(error.message)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
  },
}
