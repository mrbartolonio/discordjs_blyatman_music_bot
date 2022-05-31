const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')
const {QueryType} = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Wczytaj piosenki z YT')
    .setDefaultPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('song')
        .setDescription('Wyszukaj / podaj link do piosenki/playlisty')
        .addStringOption((option) =>
          option
            .setName('searchterms')
            .setDescription('Fraza/Link')
            .setRequired(true),
        ),
    ),
  run: async ({client, interaction}) => {
    if (!interaction.member.voice.channel)
      return interaction.editReply(
        'Musisz przebywać na kanale głosowym, aby korzystać z tej komendy',
      )

    const queue = await client.player.createQueue(interaction.guild)
    if (!queue.connection) await queue.connect(interaction.member.voice.channel)

    let embed = new MessageEmbed()

    if (interaction.options.getSubcommand() === 'song') {
      let url = interaction.options.getString('searchterms')

      if (validURL(url)) {
        if (/^.*(list=).*/.test(url)) {
          const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_PLAYLIST,
          })

          if (result.tracks.length === 0)
            return interaction.editReply('Brak wyników')

          const playlist = result.playlist
          await queue.addTracks(result.tracks)
          embed
            .setDescription(
              `**${result.tracks.length} piosenek z [${playlist.title}](${playlist.url})** zostało dodanych do kolejki`,
            )
            .setThumbnail(playlist.thumbnail)
        } else {
          const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_VIDEO,
          })
          if (result.tracks.length === 0)
            return interaction.editReply('Brak wyników')

          const song = result.tracks[0]
          await queue.addTrack(song)
          embed
            .setDescription(
              `**[${song.title}](${song.url})** dodany do kolejki`,
            )
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Czas trwania: ${song.duration}`})
        }
      } else {
        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        })

        if (result.tracks.length === 0)
          return interaction.editReply('Brak wyników')

        const song = result.tracks[0]
        await queue.addTrack(song)
        embed
          .setDescription(`**[${song.title}](${song.url})** dodany do kolejki`)
          .setThumbnail(song.thumbnail)
          .setFooter({text: `Czas trwania: ${song.duration}`})
      }
    }
    if (!queue.playing) await queue.play()
    await interaction.editReply({
      embeds: [embed],
    })
  },
}

function validURL(str) {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ) // fragment locator
  return !!pattern.test(str)
}

function isplaylist(str) {
  var pattern = new RegExp('/^.*(list=).*/') // fragment locator
  return !!pattern.test(str)
}
