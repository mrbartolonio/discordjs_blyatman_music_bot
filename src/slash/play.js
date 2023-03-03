const {EmbedBuilder, SlashCommandBuilder} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()

    .setName('play')
    .setDescription('Odtwórz piosenkę')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('Podaj nazwę lub link do piosenki')
        .setRequired(true),
    ),

  run: async ({client, interaction}) => {
    const {options, member, guild, channel} = interaction

    const query = options.getString('name')

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
      client.distube.play(voiceChannel, query, {
        textChannel: channel,
        member: member,
      })
      return interaction.reply({content: 'Przetwarzanie...🤔'})
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription(error.message)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
  },
}
