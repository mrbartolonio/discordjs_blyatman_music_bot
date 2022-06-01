const {MessageEmbed} = require('discord.js')
let {dbObj} = require('./message_listener')
function updater(player, channels) {
  console.log(`---[EmbedUpdater module start]---`)
  player.on('trackStart', (queue, track) =>
    console.log(`🎶 | Now playing **${track.title}**!`),
  )
  player.on('trackAdd', (queue, track) => console.log('dodana piosenka'))

  player.on('tracksAdd', (queue, track) => console.log('dodano piosenki'))

  player.on('botDisconnect', (queue) => {
    let embedPlayer = new MessageEmbed()
    embedPlayer
      .setColor('#0099ff')
      .setDescription('No i co ty sobą reprezentujesz?!')

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

  player.on('trackEnd', (queue, track) => console.log('skonczyl sie traczek'))

  player.on('error', (queue, error) => console.log(`Wystąpił błąd:  ` + error))
}

function updateEmbed(queue, track) {
  console.log('elo')
}
module.exports = updater
