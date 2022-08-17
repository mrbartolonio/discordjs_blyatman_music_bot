const {MessageEmbed} = require('discord.js')
let {dbObj} = require('./message_listener')
async function updater(client, player, channels) {
  console.log(`---[EmbedUpdater module start]---`)

  player.on('trackStart', async (queue) => {
    updateEmbed(queue, client, channels)
  })

  player.on('trackAdd', async (queue) => {
    updateEmbed(queue, client, channels)
  })

  player.on('tracksAdd', async (queue) => {
    updateEmbed(queue, client, channels)
  })

  player.on('botDisconnect', (queue) => {
    let embedPlayer = new MessageEmbed()
    embedPlayer
      .setColor('#0099ff')
      .setDescription('No i co ty sobą reprezentujesz?!')
    setDefEmbed(queue, channels)
    channels.cache
      .get(dbObj[queue.guild.id].channel)
      .send({embeds: [embedPlayer]})
      .then((sent) => {
        setTimeout(() => {
          sent.delete()
        }, 5000)
      })
  })

  player.on('channelEmpty', (queue) => {
    let embedPlayer = new MessageEmbed()
    setDefEmbed(queue, channels)
    embedPlayer.setColor('#0099ff').setDescription('To ja spierdalam, naura!')

    channels.cache
      .get(dbObj[queue.guild.id].channel)
      .send({embeds: [embedPlayer]})
      .then((sent) => {
        setTimeout(() => {
          sent.delete()
        }, 5000)
      })
  })

  player.on('trackEnd', (queue) => {
    if (queue.tracks.length <= 0) {
      setDefEmbed(queue, channels)
    }
  })

  player.on('error', (queue, error) => console.log(`Wystąpił błąd:  ` + error))
}

async function updateEmbed(queue) {
  let qq = queue
  const currentSong = qq.current

  if (currentSong) {
    let page = 0
    const queueString = qq.tracks
      .slice(page * 10, page * 10 + 10)
      .map((song, i) => {
        return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${
          song.title
        }](${song.url}) -- <@${song.requestedBy.id}>`
      })
      .join('\n')
    let embedPlayer = new MessageEmbed()
    let size = Object.keys(qq.tracks).length

    embedPlayer
      .setColor('#0099ff')
      .setDescription('siemka')
      .setThumbnail(currentSong.thumbnail)
      .setFooter({
        text: `${size > 10 ? '+' : ''} ${size > 10 ? size - 10 : ''} ${
          size > 10
            ? `piosenek w kolejce | [${msToMinAndSec(
                qq.totalTime,
              )}] czas trwania kolejki`
            : ''
        }`,
      })
      .addFields(
        {
          name: 'Status:',
          value: `${
            queue.connection.paused ? 'Wstrzymano' : 'Trwa odtwarzanie'
          }`,
          inline: true,
        },
        {
          name: 'Powtarzanie',
          value: `${getNameRepeat(queue.repeatMode)}`,
          inline: true,
        },
      )
      .setDescription(
        `**Teraz Odtwarzane**\n` +
          (currentSong
            ? `\`[${currentSong.duration}]\` [${currentSong.title}](${currentSong.url}) -- <@${currentSong.requestedBy.id}>`
            : 'Nic') +
          `\n\n**Kolejka**\n${queueString == '' ? 'Brak' : queueString}`,
      )
    //chuj wie dlaczego footer nie dziala dodatkowo skip button cos pierdoli a /skip dziala
    try {
      await queue.metadata.edit({
        embeds: [embedPlayer],
      })
    } catch (error) {
      console.log(error)
    }
  }
}

function getNameRepeat(mode) {
  switch (mode) {
    case 0:
      return 'OFF'
    case 1:
      return 'Piosenka'
    case 2:
      return 'Kolejka'
    case 3:
      return 'AutoPlay'
    default:
      break
  }
}

const defaultEmbed = new MessageEmbed()
  .setAuthor({name: 'Odtwarzacz'})
  .setColor('#0099ff')
  .setDescription('Kolejka w tym momencie jest pusta')
  .setImage(
    'https://c.tenor.com/vlKNvGLsYhUAAAAd/vodka-putin-syka-blyat-dance.gif',
  )

async function setDefEmbed(queue, channels) {
  let message = await channels.cache
    .get(dbObj[queue.guild.id].channel)
    .messages.fetch(dbObj[queue.guild.id].message)

  await message.edit({
    content:
      'Dołącz do kanału głosowego i dodaj piosenkę do kolejki po nazwie lub adresie url. Obsługiwane: YT/Spotify',
    embeds: [defaultEmbed],
  })
  /*  .fetchMessage(dbObj[queue.guild.id].message)
  message.edit({embed: defaultEmbed}) */
}

function msToMinAndSec(millis) {
  var minutes = Math.floor(millis / 60000)
  var seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

module.exports = {updater, defaultEmbed, setDefEmbed, updateEmbed}
