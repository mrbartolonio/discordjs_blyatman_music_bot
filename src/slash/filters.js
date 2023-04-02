/* eslint-disable no-useless-escape */
const moment = require('moment')
const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js')
//const {Playlist} = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filters')
    .setDescription('Filtry dźwięku')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Filtr')
        .setRequired(true)
        .addChoices(
          {name: 'Off', value: 'Off'},
          {name: 'lofi', value: 'lofi'},
          {name: '8D', value: '8D'},
          {name: 'bassboost', value: 'bassboost'},
          {name: 'compressor', value: 'compressor'},
          {name: 'karaoke', value: 'karaoke'},
          {name: 'vibrato', value: 'vibrato'},
          {name: 'vaporwave', value: 'vaporwave'},
          {name: 'nightcore', value: 'nightcore'},
          {name: 'tremolo', value: 'tremolo'},
        )
        .setRequired(true),
    ),

  async execute({client, interaction}) {
    const {options, member, guild} = interaction

    const queue = client.player.nodes.get(guild)

    const filter = options.getString('type')

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
      if (!queue.filters.ffmpeg) {
        embed
          .setColor('Purple')
          .setDescription(`Filtry FFmppeg nie są **dostępne** dla tej kolejki`)
        await interaction.editReply({embeds: [embed], content: ''})
      }

      try {
        if (filter === 'Off') {
          console.log(queue)
          await queue.filters.ffmpeg.setFilters(false)
          embed
            .setColor('Purple')
            .setDescription(`Wszystkie filtry zostały **Wyłączone**`)
          await interaction.editReply({embeds: [embed], content: ''})

          setTimeout(() => {
            try {
              return interaction.deleteReply()
            } catch (error) {
              console.log(error)
            }
          }, 5000)
        }

        // if the filter is bassboost, then enable audio normalizer to avoid distortion
        await queue.filters.ffmpeg.toggle(
          filter.includes('bassboost') ? ['bassboost', 'normalizer'] : filter,
        )

        embed
          .setColor('Purple')
          .setDescription(
            ` **${filter}** został **${
              queue.filters.ffmpeg.isEnabled(filter) ? 'włączony' : 'wyłączony'
            }**`,
          )
        await interaction.editReply({embeds: [embed], content: ''})

        setTimeout(() => {
          try {
            interaction.deleteReply()
          } catch (error) {
            console.log(error)
          }
        }, 5000)
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

function msToMinAndSec(millis) {
  var minutes = Math.floor(millis / 60000)
  var seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}
