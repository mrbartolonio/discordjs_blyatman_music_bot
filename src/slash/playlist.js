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
      subcommand.setName('save').setDescription('zapisuje'),
    )
    .addSubcommand(
      (subcommand) =>
        subcommand
          .setName('load')
          .setDescription('load')
          .addStringOption((option) =>
            option
              .setName('nazwa')
              .setDescription('Podaj nazwę playlisty')
              .setRequired(true)
              .setAutocomplete(true),
          ),
      /*          .addUserOption((option) =>
            option.setName('target').setDescription('The user'),
          ), */
      /*         .addStringOption(
          (option) =>
            option
              .setName('load')
              .setDescription('Podaj nazwę lub link do piosenki'),
          // .setRequired(true),
          // .setAutocomplete(true),
        ), */
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
        case 'save':
          //TODO: Dodać zeby aktualnie odtwarzana piosenka pushowała się na sam początek tracks'ow

          const tracks = queue.tracks.toArray()

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
          console.log(redone)
          db.run(
            'INSERT INTO playlists(user, playlist,name) VALUES(?, ?,?)',
            [member.user.id, JSON.stringify(redone), 'Playlista numer 1'],
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
          break

        case 'load':
          const playlist_id = interaction.options.getString('nazwa')

          db.all(
            `SELECT * FROM playlists WHERE user = (${member.user.id}) AND id =${playlist_id}`,
            async (err, rows) => {
              console.log(err)
              console.log(rows)
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

                  console.log(searchResult.tracks[0])
                  queue.addTrack(searchResult.tracks[0])
                  await interaction.followUp({
                    content: `⏱ | Ładowanie  ${
                      searchResult.playlist ? 'Playlisty' : 'Piosenki'
                    }...`,
                  })

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

    if (query.length >= 1) {
      db.all(
        `SELECT * FROM playlists WHERE user = (${member.user.id})`,
        async (err, rows) => {
          if (err) return console.log(err.message)
          if (rows.length > 0) {
            await interaction.respond(
              rows
                .filter((u) =>
                  u.name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((choice) => ({
                  name: `${choice.name} ➔[${
                    JSON.parse(choice.playlist).length
                  } utworów]`,
                  value: `${choice.id}`,
                })),
            )
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

    /*     if (
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(
        query,
      )
    ) {
      return interaction.respond([{name: query, value: query}])
    } else {
      const results = await client.player.search(query)

      return interaction.respond(
        results.tracks.slice(0, 10).map((t) => {
          return {
            name: `${t.title.slice(0, 50)} - ${t.author.slice(0, 30)} | ${
              t.duration
            }`,
            value: t.url,
          }
        }),
      )
    } */
  },
}
