/* eslint-disable no-useless-escape */
const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ustawia głośność odtwarzania')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((option) =>
      option
        .setName('vol')
        .setDescription('Wartość od 0 do 100. Wartość traktowana jako procenty')
        .setRequired(true),
    ),

  async execute({client, interaction}) {
    const {options, member, guild} = interaction

    const query = options.getInteger('vol')

    const queue = client.player.nodes.get(guild)

    const voiceChannel = member.voice.channel
    const embed = new EmbedBuilder()

    await interaction.deferReply()

    if (!voiceChannel) {
      embed
        .setColor('Red')
        .setDescription(
          'Musisz przebywać na kanale głosowym aby używać komend związanych z botem',
        )
      return interaction.followUp({embeds: [embed], ephemeral: true})
    }

    if (!member.voice.channelId == guild.members.me.voice.channelId) {
      embed
        .setColor('Red')
        .setDescription(
          `Nie możesz używać odtwarza jeżeli działa na innym kanale <#${guild.members.me.voice.channelId}>`,
        )
      return interaction.reply({embeds: [embed], ephemeral: true})
    }

    if (queue?.currentTrack) {
      try {
        await queue.node.setVolume(query)
        embed
          .setColor('Orange')
          .setDescription(`Ustawiono głośność na ${query}%`)

        await interaction.editReply({embeds: [embed], content: ''})

        setTimeout(() => {
          try {
            interaction.deleteReply()
          } catch (error) {
            console.log(error)
          }
        }, 7000)
      } catch (error) {
        console.log(error)
        embed.setColor('Red').setDescription(error.message).setTitle('Error')
        await interaction.editReply({embeds: [embed], content: ''})
      }
    } else {
      embed.setColor('Red').setDescription(`Brak kolejki odtwarzania`)

      await interaction.editReply({embeds: [embed], content: ''})

      setTimeout(() => {
        try {
          interaction.deleteReply()
        } catch (error) {
          console.log(error)
        }
      }, 7000)
    }
  },
}
