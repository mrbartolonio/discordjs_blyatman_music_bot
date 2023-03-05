const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js')
const {QueryType} = require('discord-player')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Odtwórz piosenkę')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName('tresc')
        .setDescription('Podaj nazwę lub link do piosenki')
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async execute({client, interaction}) {
    const {options, member, guild} = interaction

    const query = options.getString('tresc')
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

    const searchResult = await client.player
      .search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      })
      .catch(() => {
        console.log('he')
      })

    if (!searchResult || !searchResult.tracks.length)
      return void interaction.followUp({content: 'No results were found!'})

    const queue = client.player.nodes.create(guild, {
      metadata: {
        channel: interaction.channel,
        client: interaction.guild.members.me,
        requestedBy: interaction.user,
      },
      selfDeaf: true,
      volume: 50,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 300000,
      leaveOnEnd: true,
      leaveOnEndCooldown: 300000,
    })

    try {
      //  if (!queue.connection) await queue.connect(member.voice.channel)
    } catch (error) {
      console.log(error)
      // if (!queue.deleted) queue.delete()
      return void interaction.followUp({
        content: 'Could not join your voice channel!',
      })
    }

    await interaction.followUp({
      content: `⏱ | Loading your ${
        searchResult.playlist ? 'playlist' : 'track'
      }...`,
    })
    if (!queue.connection) await queue.connect(voiceChannel)

    searchResult.playlist
      ? queue.addTrack(searchResult.tracks)
      : queue.addTrack(searchResult.tracks[0])
    if (!queue.playing) {
      try {
        await queue.node.play()
        embed
          .setColor('blue')
          .setDescription(
            searchResult.playlist
              ? `Dodano [${searchResult._data.playlist.title}](${searchResult._data.playlist.url}) do odtwarzania | ${searchResult._data.playlist.tracks.length} utwórów`
              : `Dodano [${searchResult._data.tracks[0].author} - ${searchResult._data.tracks[0].title}](${searchResult._data.tracks[0].url}) [${searchResult._data.tracks[0].duration}]do odtwarzania`,
          )
          //yt zwraca thumbnail w innym obiekcie, dopasowac miedzy spotify a yt
          .setThumbnail(
            searchResult.playlist
              ? searchResult._data.playlist.thumbnail
              : searchResult._data.tracks[0].thumbnail,
          )
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
        await interaction.editReply({content: error.message})
      }
    }
  },

  async autocomplete({client, interaction}) {
    const query = interaction.options.getString('tresc')

    if (
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
    }
  },
}
