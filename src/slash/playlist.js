/* eslint-disable no-useless-escape */
const db = require('../utils/database')
const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js')
const {QueryType} = require('discord-player')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('testowa kolejka')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('save')
        .setDescription('Zapisuje aktualną kolejkę jako playlistę')
        .addStringOption((option) =>
          option
            .setName('nazwa')
            .setDescription('Podaj nazwę playlisty')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('load')
        .setDescription('Wczytuje zapisaną playlistę')
        .addStringOption((option) =>
          option
            .setName('nazwa')
            .setDescription('Podaj nazwę playlisty')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Usuwa wybraną playlistę')
        .addStringOption((option) =>
          option
            .setName('nazwa')
            .setDescription('Podaj nazwę playlisty')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    ),

  async execute({client, interaction}) {
    const {options, member, guild} = interaction

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

    const sub = options.getSubcommand()

    try {
      switch (sub) {
        case 'remove':
          const nametoremove = interaction.options.getString('nazwa')

          if (nametoremove === 'null') {
            embed.setColor('Red').setDescription(`Wybierz playlistę`)

            await interaction.editReply({embeds: [embed], content: ''})

            setTimeout(() => {
              try {
                interaction.deleteReply()
              } catch (error) {
                console.log(error)
              }
            }, 5000)
          } else {
            db.all(
              `SELECT name FROM playlists WHERE id = ${nametoremove} AND user = ${member.user.id}`,
              async (error, row) => {
                if (error) return console.log(error.message)
                if (row.length > 0) {
                  db.run(
                    `DELETE FROM playlists WHERE id = ${nametoremove} AND user = ${member.user.id}`,
                    async (err, rows) => {
                      if (err) {
                        embed
                          .setColor('Red')
                          .setDescription(
                            `Wystąpił błąd podczas usuwania. ${err.message}`,
                          )

                        await interaction.editReply({
                          embeds: [embed],
                          content: '',
                        })

                        setTimeout(() => {
                          try {
                            interaction.deleteReply()
                          } catch (error) {
                            console.log(error)
                          }
                        }, 5000)
                        return console.log(err.message)
                      } else {
                        console.log(row)
                        embed
                          .setColor('Green')
                          .setDescription(
                            `Pomyślnie usunięto **${row[0].name}**`,
                          )

                        await interaction.editReply({
                          embeds: [embed],
                          content: '',
                        })

                        setTimeout(() => {
                          try {
                            interaction.deleteReply()
                          } catch (error) {
                            console.log(error)
                          }
                        }, 5000)
                      }
                    },
                  )
                }
              },
            )
          }

          break

        case 'save':
          const nameplay = interaction.options.getString('nazwa')

          db.all(
            `SELECT * FROM playlists WHERE user = (${member.user.id})`,
            async (err, rows) => {
              if (err) return console.log(err.message)
              if (rows.length > 15) {
                embed
                  .setColor('Red')
                  .setDescription(
                    `Masz utworzone 15 playlist! Zwolnij miejsce aby móc zapisać nową!`,
                  )

                await interaction.editReply({embeds: [embed], content: ''})

                setTimeout(() => {
                  try {
                    interaction.deleteReply()
                  } catch (error) {
                    console.log(error)
                  }
                }, 5000)
              } else {
                if (!queue?.currentTrack) {
                  embed
                    .setColor('Red')
                    .setDescription(`Brak kolejki odtwarzania`)

                  await interaction.editReply({embeds: [embed], content: ''})

                  setTimeout(() => {
                    try {
                      interaction.deleteReply()
                    } catch (error) {
                      console.log(error)
                    }
                  }, 5000)
                } else {
                  //https://open.spotify.com/playlist/3DbzVM500CO9llaYeNxMgo?si=78f7502b794847be
                  const tracks = queue.tracks.toArray()
                  if (queue.currentTrack) {
                    tracks.unshift(queue.currentTrack)
                  }

                  /* tracks.push(all)
            console.log(tracks) */

                  const redone = tracks.map((items) => {
                    if (items.queryType === 'spotifySong') {
                      return {
                        url: items.url,
                        type: 'spotify',
                      }
                    } else {
                      return {
                        url: items.url,
                        type: 'other',
                      }
                    }
                  })

                  db.run(
                    'INSERT INTO playlists(user, playlist,name) VALUES(?, ?,?)',
                    [member.user.id, JSON.stringify(redone), nameplay],
                    (err) => {
                      if (err) {
                        return console.log(err.message)
                      }
                      console.log(`Row was added to the table`)
                    },
                  )
                  embed.setColor('Orange').setDescription(`Zapisano playlistę`)

                  await interaction.editReply({embeds: [embed], content: ''})

                  setTimeout(() => {
                    try {
                      interaction.deleteReply()
                    } catch (error) {
                      console.log(error)
                    }
                  }, 5000)
                }
              }
            },
          )
          break

        case 'load':
          const playlist_id = interaction.options.getString('nazwa')
          if (playlist_id === 'null') {
            embed.setColor('Red').setDescription(`Wybierz playlistę`)

            await interaction.editReply({embeds: [embed], content: ''})

            setTimeout(() => {
              try {
                interaction.deleteReply()
              } catch (error) {
                console.log(error)
              }
            }, 5000)
          } else {
            db.all(
              `SELECT * FROM playlists WHERE user = (${member.user.id}) AND id =${playlist_id}`,
              async (err, rows) => {
                console.log(err)
                if (err) return console.log(err.message)
                if (rows.length > 0) {
                  const tracks = JSON.parse(rows[0].playlist)
                  let queue = client.player.nodes.get(guild)
                  let playing = false
                  const voiceChannel = member.voice.channel
                  if (queue?.currentTrack) playing = true

                  const searchResult = await client.player
                    .search(tracks[0].url, {
                      requestedBy: interaction.user,
                      searchEngine: QueryType.AUTO,
                    })
                    .catch((e) => {
                      console.log(e)
                    })

                  if (playing) {
                    queue.addTrack(searchResult.tracks[0])
                  } else {
                    queue = client.player.nodes.create(guild, {
                      metadata: {
                        channel: interaction.channel,
                        client: interaction.guild.members.me,
                        requestedBy: interaction.user,
                      },
                      selfDeaf: true,
                      volume: 50,
                      leaveOnEmpty: true,
                      leaveOnEmptyCooldown: 3000,
                      leaveOnEnd: true,
                      leaveOnEndCooldown: 3000,
                    })

                    try {
                      if (!queue.connection) await queue.connect(voiceChannel)
                    } catch (error) {
                      console.log(error)
                      // if (!queue.deleted) queue.delete()
                      return void interaction.followUp({
                        content: 'Nie mogę dołączyć na twój kanał!',
                      })
                    }

                    queue.addTrack(searchResult.tracks[0])
                    await interaction.followUp({
                      content: `⏱ | Wczytywanie...`,
                    })
                    setTimeout(() => {
                      try {
                        interaction.deleteReply()
                      } catch (error) {
                        console.log(error)
                      }
                    }, 5000)

                    if (!queue.playing) {
                      try {
                        await queue.node.play()
                        playing = true
                      } catch (error) {
                        console.log(error)
                        embed
                          .setColor('Red')
                          .setDescription(error.message)
                          .setTitle('Error')
                        await interaction.editReply({
                          embeds: [embed],
                          content: '',
                        })
                      }
                    }
                  }

                  if (tracks.length > 1) {
                    for (let i = 1; i < tracks.length; i++) {
                      const searchResult = await client.player
                        .search(tracks[i].url, {
                          requestedBy: interaction.user,
                          searchEngine: QueryType.AUTO,
                        })
                        .catch((e) => {
                          console.log(e)
                        })

                      await queue.addTrack(searchResult.tracks[0])
                    }
                  }
                }
              },
            )
          }
          break

        default:
          break
      }

      //  queue.tracks.shuffle()

      //w taki sposób dodać tracksy
      // queue.addTrack(searchResult.tracks)
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription(error.message).setTitle('Error')
      await interaction.editReply({embeds: [embed], content: ''})
    }
  },

  async autocomplete({client, interaction}) {
    const {options, member, guild} = interaction
    const query = interaction.options.getString('nazwa')
    const sub = options.getSubcommand()
    switch (sub) {
      case 'remove':
        if (query.length >= 1) {
          db.all(
            `SELECT * FROM playlists WHERE user = (${member.user.id})`,
            async (err, rows) => {
              if (err) return console.log(err.message)
              if (rows.length > 0) {
                await interaction.respond(
                  rows
                    .filter((u) =>
                      u?.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((choice) => ({
                      name: `${choice.name} ➔[${
                        JSON.parse(choice.playlist).length
                      } utworów]`,
                      value: `${choice.id}`,
                    })),
                )
              } else {
                await interaction.respond([
                  {
                    name: `Brak playlisty o takiej nazwie`,
                    value: `null`,
                  },
                ])
              }
            },
          )
        } else {
          db.all(
            `SELECT * FROM playlists WHERE user = (${member.user.id})`,
            async (err, rows) => {
              if (err) return console.log(err.message)
              if (rows.length > 0) {
                await interaction.respond(
                  rows.map((choice) => ({
                    name: `${choice.name} ➔[${
                      JSON.parse(choice.playlist).length
                    } utworów]`,
                    value: `${choice.id}`,
                  })),
                )
              }
            },
          )
        }
        break

      case 'load':
        if (query.length >= 1) {
          db.all(
            `SELECT * FROM playlists WHERE user = (${member.user.id})`,
            async (err, rows) => {
              if (err) return console.log(err.message)
              if (rows.length > 0) {
                await interaction.respond(
                  rows
                    .filter((u) =>
                      u?.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((choice) => ({
                      name: `${choice.name} ➔[${
                        JSON.parse(choice.playlist).length
                      } utworów]`,
                      value: `${choice.id}`,
                    })),
                )
              } else {
                await interaction.respond([
                  {
                    name: `Brak playlisty o takiej nazwie`,
                    value: `null`,
                  },
                ])
              }
            },
          )
        } else {
          db.all(
            `SELECT * FROM playlists WHERE user = (${member.user.id})`,
            async (err, rows) => {
              if (err) return console.log(err.message)
              if (rows.length > 0) {
                await interaction.respond(
                  rows.map((choice) => ({
                    name: `${choice.name} ➔[${
                      JSON.parse(choice.playlist).length
                    } utworów]`,
                    value: `${choice.id}`,
                  })),
                )
              }
            },
          )
        }
        break
      default:
        break
    }
  },
}
