const {EmbedBuilder, SlashCommandBuilder} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('kolejka')
    .setDescription(`Wyświetla aktualną kolejkę odtwarzania`),

  run: async ({client, interaction}) => {
    const {member, guild} = interaction

    const voiceChannel = member.voice.channel

    const embed = new EmbedBuilder()

    if (!voiceChannel) {
      embed
        .setColor('Red')
        .setDescription(
          'Musisz przebywać na kanale głosowym aby używać komend związanych z botem',
        )
      return interaction.reply({embeds: [embed], ephemeral: true})
    }

    if (!member.voice.channelId == guild.members.me.voice.channelId) {
      embed
        .setColor('Red')
        .setDescription(
          `Nie możesz używać odtwarza jeżeli działa na innym kanale <#${guild.members.me.voice.channelId}>`,
        )
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
    const queue = await client.distube.getQueue(voiceChannel)

    if (!queue) {
      embed.setColor('Red').setDescription(`Brak aktywnej kolejki odtwarzania`)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
    try {
      embed
        .setColor('Purple')
        .setDescription(
          `${queue.songs
            .slice(0, 15)
            .map(
              (song, id) =>
                `\n**${id + 1}.** \`[${song.formattedDuration}]\` [${
                  song.name
                }](${song.url}) - ${song.user}`,
            )
            .join('')}`,
        )

        .setFooter({
          text: `${
            Object.keys(queue.songs).length - 15 > 0
              ? `Dodatkowo ${
                  Object.keys(queue.songs).length - 15
                } piosenek w kolejce | Czas trwania: [${msToMinAndSec(
                  queue.duration * 1000,
                )}]`
              : 'Brak dodatkowych piosenek w kolejce'
          }`,
        })

      return interaction.reply({embeds: [embed], ephemeral: true})
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription(error.message)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
  },
}

function msToMinAndSec(millis) {
  var minutes = Math.floor(millis / 60000)
  var seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}
