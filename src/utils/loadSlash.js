const {Routes} = require('discord-api-types/v9')
const {REST} = require('@discordjs/rest')
const fs = require('fs')

module.exports = function loadSlashCommands(client, guildId) {
  // console.log(`---[LoadSlash module start]---`)
  const CLIENT_ID = process.env.CLIENT_ID

  let commands = []

  const slashFiles = fs
    .readdirSync(__dirname + '/../slash')
    .filter((file) => file.endsWith('.js'))
  for (const file of slashFiles) {
    const slashcmd = require(__dirname + `/../slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    commands.push(slashcmd.data.toJSON())
  }

  const rest = new REST({version: '9'}).setToken(process.env.TOKEN)
  console.log("Deploy'owanie komend")
  if (guildId) {
    rest
      .put(Routes.applicationGuildCommands(CLIENT_ID, guildId), {
        body: commands,
      })
      .then(() => {
        console.log(`Zakończono deploy dla Guilda : ${guildId}`)
      })
      .catch((err) => {
        if (err) {
          console.log(err)
        }
      })
  } else {
    let ids = client.guilds.cache.map((g) => g.id) || 'None'
    for (let i = 0; i < ids.length; i++) {
      rest
        .put(Routes.applicationGuildCommands(CLIENT_ID, ids[i]), {
          body: commands,
        })
        .then(() => {
          console.log(`Zakończono deploy dla Guilda : ${ids[i]}`)
        })
        .catch((err) => {
          if (err) {
            console.log(err)
          }
        })
    }
  }
}
