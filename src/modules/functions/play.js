const {MessageEmbed} = require('discord.js')
const {QueryType} = require('discord-player')

async function play(user, content, channel, guild, vc, client) {
  if (!vc) {
    let embed = new MessageEmbed()
    embed.setDescription(
      `Musisz przebywać na kanale głosowym, aby korzystać z tej funkcji`,
    )
    channel.send({embeds: [embed]}).then((sent) => {
      setTimeout(() => {
        sent.delete()
      }, 3000)
    })
  } else {
    if (validURL(content)) {
      if (
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(
          content,
        )
      ) {
        if (/^.*(youtu.be\/|playlist?)([^#\&\?]*).*/.test(content)) {
          //playlista yt
          const result = await client.player.search(content, {
            requestedBy: user,
            searchEngine: QueryType.YOUTUBE_PLAYLIST,
          })

          if (result.tracks.length === 0) {
            let embed = new MessageEmbed()
            embed.setDescription(`Brak wyników`)
            channel.send({embeds: [embed]}).then((sent) => {
              setTimeout(() => {
                sent.delete()
              }, 3000)
            })
          } else {
            const queue = await client.player.createQueue(guild)
            if (!queue.connection) await queue.connect(vc)
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            if (!queue.playing) await queue.play()
            let embed = new MessageEmbed()
            embed
              .setDescription(
                `**${result.tracks.length} piosenek z [${playlist.title}](${playlist.url})** zostało dodanych do kolejki`,
              )
              .setThumbnail(playlist.thumbnail),
              channel.send({embeds: [embed]}).then((sent) => {
                setTimeout(() => {
                  sent.delete()
                }, 5000)
              })
          }
        } else {
          //video yt
          const queue = await client.player.createQueue(guild)
          if (!queue.connection) await queue.connect(vc)
          const result = await client.player.search(content, {
            requestedBy: user,
            searchEngine: QueryType.YOUTUBE_VIDEO,
          })
          if (result.tracks.length === 0) {
            let embed = new MessageEmbed()
            embed.setDescription(`Brak wyników`)
            channel.send({embeds: [embed]}).then((sent) => {
              setTimeout(() => {
                sent.delete()
              }, 3000)
            })
          } else {
            const song = result.tracks[0]
            await queue.addTrack(song)
            if (!queue.playing) await queue.play()
            let embed = new MessageEmbed()
            embed
              .setDescription(
                `**[${song.title}](${song.url})** dodany do kolejki`,
              )
              .setThumbnail(song.thumbnail)
              .setFooter({text: `Czas trwania: ${song.duration}`}),
              channel.send({embeds: [embed]}).then((sent) => {
                setTimeout(() => {
                  sent.delete()
                }, 5000)
              })
          }
        }
      } else {
        //spotify
        if (
          /(https?:\/\/open.spotify.com\/(playlist)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/.test(
            content,
          )
        ) {
          //playlista
          const result = await client.player.search(content, {
            requestedBy: user,
            searchEngine: QueryType.SPOTIFY_PLAYLIST,
          })

          if (result.tracks.length === 0) {
            let embed = new MessageEmbed()
            embed.setDescription(`Brak wyników`)
            channel.send({embeds: [embed]}).then((sent) => {
              setTimeout(() => {
                sent.delete()
              }, 3000)
            })
          } else {
            const queue = await client.player.createQueue(guild)
            if (!queue.connection) await queue.connect(vc)
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            if (!queue.playing) await queue.play()
            let embed = new MessageEmbed()
            embed
              .setDescription(
                `**${result.tracks.length} piosenek z [${playlist.title}](${playlist.url})** zostało dodanych do kolejki`,
              )
              .setThumbnail(playlist.thumbnail),
              channel.send({embeds: [embed]}).then((sent) => {
                setTimeout(() => {
                  sent.delete()
                }, 5000)
              })
          }
        } else if (
          /(https?:\/\/open.spotify.com\/(track)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/.test(
            content,
          )
        ) {
          //utwór
          const queue = await client.player.createQueue(guild)
          if (!queue.connection) await queue.connect(vc)
          const result = await client.player.search(content, {
            requestedBy: user,
            searchEngine: QueryType.SPOTIFY_SONG,
          })
          if (result.tracks.length === 0) {
            let embed = new MessageEmbed()
            embed.setDescription(`Brak wyników`)
            channel.send({embeds: [embed]}).then((sent) => {
              setTimeout(() => {
                sent.delete()
              }, 3000)
            })
          } else {
            const song = result.tracks[0]
            await queue.addTrack(song)
            if (!queue.playing) await queue.play()
            let embed = new MessageEmbed()
            embed
              .setDescription(
                `**[${song.title}](${song.url})** dodany do kolejki`,
              )
              .setFooter({text: `Czas trwania: ${song.duration}`}),
              channel.send({embeds: [embed]}).then((sent) => {
                setTimeout(() => {
                  sent.delete()
                }, 5000)
              })
          }
        } else if (
          /(https?:\/\/open.spotify.com\/(artist|album)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/.test(
            content,
          )
        ) {
          //autor playlista
          const result = await client.player.search(content, {
            requestedBy: user,
            searchEngine: QueryType.SPOTIFY_ALBUM,
          })

          if (result.tracks.length === 0) {
            let embed = new MessageEmbed()
            embed.setDescription(`Brak wyników`)
            channel.send({embeds: [embed]}).then((sent) => {
              setTimeout(() => {
                sent.delete()
              }, 3000)
            })
          } else {
            const queue = await client.player.createQueue(guild)
            if (!queue.connection) await queue.connect(vc)
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            if (!queue.playing) await queue.play()
            let embed = new MessageEmbed()
            embed
              .setDescription(
                `**${result.tracks.length} piosenek z [${playlist.title}](${playlist.url})** zostało dodanych do kolejki`,
              )
              .setThumbnail(playlist.thumbnail),
              channel.send({embeds: [embed]}).then((sent) => {
                setTimeout(() => {
                  sent.delete()
                }, 5000)
              })
          }
        }
      }
    } else {
      //wyszukiwarka yt
      const queue = await client.player.createQueue(guild)
      if (!queue.connection) await queue.connect(vc)
      const result = await client.player.search(content, {
        requestedBy: user,
        searchEngine: QueryType.AUTO,
      })

      if (result.tracks.length === 0) {
        let embed = new MessageEmbed()
        embed.setDescription(`Brak wyników wyszukiwania`)
        channel.send({embeds: [embed]}).then((sent) => {
          setTimeout(() => {
            sent.delete()
          }, 3000)
        })
      } else {
        const song = result.tracks[0]
        await queue.addTrack(song)
        if (!queue.playing) await queue.play()
        let embed = new MessageEmbed()
        embed
          .setDescription(`**[${song.title}](${song.url})** dodany do kolejki`)
          .setThumbnail(song.thumbnail)
          .setFooter({text: `Czas trwania: ${song.duration}`}),
          channel.send({embeds: [embed]}).then((sent) => {
            setTimeout(() => {
              sent.delete()
            }, 5000)
          })
      }
    }
  }
}

module.exports = play

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
