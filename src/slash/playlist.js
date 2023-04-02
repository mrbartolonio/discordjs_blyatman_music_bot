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
      (subcommand) => subcommand.setName('load').setDescription('load'),
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
          const tracks = queue.tracks.toArray()

          const redone = tracks.map((items) => items.url)
          db.run(
            'INSERT INTO playlists(user, playlist) VALUES(?, ?)',
            [member.user.id, JSON.stringify(redone)],
            (err) => {
              if (err) {
                return console.log(err.message)
              }
              console.log(`Row was added to the table`)
            },
          )

          break

        case 'load':
          db.all(
            `SELECT * FROM playlists WHERE user = (${member.user.id})`,
            async (err, rows) => {
              if (err) return console.log(err.message)
              if (rows.length > 0) {
                const tracks = JSON.parse(rows[0].playlist)
                let queue = client.player.nodes.get(guild)
                let playing = false
                const voiceChannel = member.voice.channel
                if (queue?.currentTrack) playing = true

                for (let i = 0; i < tracks.length; i++) {
                  const searchResult = await client.player
                    .search(tracks[i], {
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

                    await interaction.followUp({
                      content: `⏱ | Ładowanie  ${
                        searchResult.playlist ? 'Playlisty' : 'Piosenki'
                      }...`,
                    })

                    if (!queue.playing) {
                      try {
                        await queue.node.play()
                        playing = true
                        /*         embed
                          .setColor('blue')
                          .setDescription(`Wczytywanie zapisanej playlisty`)
                        //yt zwraca thumbnail w innym obiekcie, dopasowac miedzy spotify a yt

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
                        }, 7000) */
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

      embed.setColor('Orange').setDescription(`Wymieszano kolejkę`)

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
  },
}
