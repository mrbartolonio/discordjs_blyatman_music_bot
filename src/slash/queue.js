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

        embed
          .setColor('Purple')
          .setDescription(
            `\n**Teraz grane:** \n \`[${queue.currentTrack.duration}]\` [${
              queue.currentTrack.title
            } - ${queue.currentTrack.author}](${queue.currentTrack.url}) - ${
              typeof queue.currentTrack.requestedBy === 'object' &&
              queue.currentTrack.requestedBy !== null
                ? queue.currentTrack.requestedBy
                : `<@${queue.currentTrack.requestedBy}>`
            } \n ${tracks
              .slice(0, 15)
              .map(
                (song, id) =>
                  `\n**${id + 1}.** \`[${song.duration}]\` [${song.title} - ${
                    song.author
                  }](${song.url}) - ${
                    typeof song.requestedBy === 'object' &&
                    song.requestedBy !== null
                      ? song.requestedBy
                      : `<@${song.requestedBy}>`
                  }`,
              )
              .join('')}`,
          )
          .addFields(
            {name: 'Głośność', value: `${queue.options.volume}%`},
            {name: '\u200B', value: '\u200B'},
            {
              name: `Tryb`,
              value: `${queue.repeatMode}`,
            },
            {
              name: 'Status',
              value: `${queue.node.isPlaying() ? 'Odtwarzanie' : 'Pauza'}`,
            },
          )
          .addFields({
            name: 'Inline field title',
            value: 'Some value here',
            inline: true,
          })
          .setTimestamp()
          .setFooter({
            text: `${
              Object.keys(tracks).length - 15 > 0
                ? `Dodatkowo ${
                    Object.keys(tracks).length - 15
                  } piosenek w kolejce | Czas trwania całej kolejki: [${moment(
                    tracks
                      .reduce(
                        (acc, t) =>
                          acc.add(
                            moment.duration(
                              moment(t.duration).format('HH:mm:ss'),
                            ),
                          ),
                        moment.duration(),
                      )
                      .as('milliseconds'),
                  ).format('HH:mm:ss')}]`
                : 'Brak dodatkowych piosenek w kolejce'
            }`,
          })

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
