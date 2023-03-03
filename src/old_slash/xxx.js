const {EmbedBuilder, SlashCommandBuilder} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('djblyat')
    .setDescription(`Komendy do zarządzania djblyatman'em`)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('Odtwórz piosenkę')
        .addStringOption((option) =>
          option
            .setName('tresc')
            .setDescription('Podaj nazwę lub link do piosenki'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('volume')
        .setDescription('Ustaw głośność odtwarzania')
        .addIntegerOption((option) =>
          option
            .setName('procenty')
            .setDescription('50=50%')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('opcje')
        .setDescription('Wybierz opcje')
        .addStringOption((option) =>
          option
            .setName('opcje')
            .setDescription('Wybierz interesującą Cię opcje')
            .setRequired(true)
            .addChoices(
              {name: 'kolejka', value: 'queue'},
              {name: 'pomiń utwór', value: 'skip'},
              {name: 'pauza', value: 'pause'},
              {name: 'wznów', value: 'resume'},
              {name: 'stop', value: 'stop'},
            ),
        ),
    ),
  run: async ({client, interaction}) => {
    const {options, member, guild, channel} = interaction

    const subcommand = options.getSubcommand()
    const query = options.getString('tresc')
    const volume = options.getInteger('procenty')
    const option = options.getString('opcje')
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

    try {
      switch (subcommand) {
        case 'play':
          client.distube.play(voiceChannel, query, {
            textChannel: channel,
            member: member,
          })
          return interaction.reply({content: 'Wczytano'})

        case 'volume':
          await client.distube.setVolume(voiceChannel, volume)
          return interaction.reply({
            content: `Głośność ustawiono na: ${volume}%`,
          })

        case 'opcje':
          // eslint-disable-next-line no-case-declarations
          const queue = await client.distube.getQueue(voiceChannel)

          if (!queue) {
            embed
              .setColor('Red')
              .setDescription('Brak aktywnej kolejki odtwarzania')
            return interaction.reply({embeds: [embed], ephemeral: true})
          }

          switch (option) {
            case 'skip':
              await queue.skip(voiceChannel)
              embed
                .setColor('Blue')
                .setDescription('Piosenka została pominięta')
              return interaction.reply({embeds: [embed], ephemeral: true})

            case 'stop':
              await queue.stop(voiceChannel)
              embed.setColor('Red').setDescription('Kolejka została zatrzymana')
              return interaction.reply({embeds: [embed], ephemeral: true})

            case 'pause':
              await queue.pause(voiceChannel)
              embed
                .setColor('Orange')
                .setDescription('Piosenka została wstrzymana')
              return interaction.reply({embeds: [embed], ephemeral: true})

            case 'resume':
              await queue.pause(voiceChannel)
              embed
                .setColor('Green')
                .setDescription('Piosenka została wznowiona')
              return interaction.reply({embeds: [embed], ephemeral: true})

            case 'queue':
              embed
                .setColor('Purple')
                .setDescription(
                  `${queue.songs
                    .slice(0, 10)
                    .map(
                      (song, id) =>
                        `\n**${id + 1}.** \`[${song.formattedDuration}]\` [${
                          song.name
                        }](${song.url}) - ${song.user}`,
                    )}`,
                )

                .setFooter({
                  text: `${
                    Object.keys(queue.songs).length - 10 > 0
                      ? `Dodatkowo ${
                          Object.keys(queue.songs).length - 10
                        } piosenek w kolejce | Czas trwania: [${queue.duration}]`
                      : 'Brak dodatkowych piosenek w kolejce'
                  }`,
                })
            
              return interaction.reply({embeds: [embed], ephemeral: true})
          }

          break
      }
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription(error.message)
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
  },
}
