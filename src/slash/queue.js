/* eslint-disable no-useless-escape */
const moment = require('moment')
const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Wyświetla aktualną kolejkę odtwarzania')
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

    if (queue?.currentTrack) {
      try {
        const tracks = queue.tracks.toArray()
        console.log(
          queue.currentTrack.playlist.thumbnail || queue.currentTrack.thumbnail,
        )
        console.log(queue.currentTrack.playlist.thumbnail)
        console.log(queue.currentTrack.thumbnail)
        embed
          .setColor('Purple')
          .setDescription(
            `\n**Teraz grane:** \n \`[${queue.currentTrack.duration}]\` [${
              queue.currentTrack.title
            } - ${queue.currentTrack.author}](${queue.currentTrack.url}) - ${
              queue.currentTrack.requestedBy
            } \n ${tracks
              .slice(0, 15)
              .map(
                (song, id) =>
                  `\n**${id + 1}.** \`[${song.duration}]\` [${song.title} - ${
                    song.author
                  }](${song.url}) - ${song.requestedBy}`,
              )
              .join('')}`,
          )
          .setFooter({
            text: `${
              Object.keys(tracks).length - 15 > 0
                ? `Dodatkowo ${
                    Object.keys(tracks).length - 15
                  } piosenek w kolejce | Czas trwania całej kolejki: [${moment(
                    tracks
                      .reduce(
                        (acc, t) => acc.add(moment.duration(t.duration)),
                        moment.duration(),
                      )
                      .as('milliseconds'),
                  ).format('HH:mm:ss')}]`
                : 'Brak dodatkowych piosenek w kolejce'
            }`,
          })
          .setThumbnail(
            `${
              queue.currentTrack.playlist.thumbnail
                ? queue.currentTrack.playlist.thumbnail.endsWith(
                    '.png',
                    '.jpg',
                    '.jpeg',
                    '.webp',
                  )
                  ? queue.currentTrack.playlist.thumbnail
                  : `${queue.currentTrack.playlist.thumbnail}.png `
                : queue.currentTrack.thumbnail
            }`,
          )

        await interaction.editReply({embeds: [embed], content: ''})

        setTimeout(() => {
          try {
            interaction.deleteReply()
          } catch (error) {
            console.log(error)
          }
        }, 20000)
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
