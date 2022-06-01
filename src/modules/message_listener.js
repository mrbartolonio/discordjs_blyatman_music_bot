const play = require('./functions/play')

let dbObj = []

function updateVar(guild, message, channel) {
  dbObj[`${guild}`] = {
    guild: guild,
    channel: channel,
    message: message,
  }
}

function messListener(client) {
  console.log(`---[messageListener module start]---`)
  client.on('messageCreate', (mess) => {
    if (dbObj[mess.guildId].channel == mess.channel.id) {
      if (!mess.member.user.bot) {
        play(
          mess.member.user,
          mess.content,
          mess.channel,
          mess.guildId,
          mess.member.voice.channel,
          client,
        )
        mess.delete()
      }
    }
  })
}

module.exports = {updateVar, messListener}
