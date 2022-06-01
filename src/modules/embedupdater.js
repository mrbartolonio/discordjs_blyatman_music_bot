function updater(player) {
  console.log(`---[EmbedUpdater module start]---`)
  player.on('trackStart', (queue, track) =>
    console.log(`🎶 | Now playing **${track.title}**!`),
  )
  player.on('trackAdd', (queue, track) => console.log('dodana piosenka'))

  player.on('tracksAdd', (queue, track) => console.log('dodano piosenki'))
  player.on('botDisconnect', (queue) => console.log('pusto jest'))

  player.on('trackEnd', (queue, track) => console.log('skonczyl sie traczek'))
  player.on('error', (queue, error) => console.log(`Wystąpił błąd` + error))
}

function updateEmbed(queue, track) {
  console.log('elo')
}
module.exports = updater
