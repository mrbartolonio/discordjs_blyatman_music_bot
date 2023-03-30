/* eslint-disable no-useless-escape */
const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pomija bieżący utwór')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute({client, interaction}) {
    const {member, guild} = interaction

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

    if (queue.node.isPlaying()) {
      try {
        queue.node.skip()

        embed
          .setColor('Orange')
          .setDescription(
            `Pominięto [${queue.currentTrack.title} - ${queue.currentTrack.author}](${queue.currentTrack.url})`,
          )
          .setThumbnail(`${queue.currentTrack.thumbnail}`)

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
