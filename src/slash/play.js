const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  VoiceChannel,
  GuildEmoji,
} = require('discord.js')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
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
          return interaction.reply({content: 'Dodano piosenkę'})
          break
        case 'volume':
          client.distube.setVolume(voiceChannel, volume)
          return interaction.reply({
            content: `Głośność ustawiono na: ${volume}%`,
          })
          break
        case 'opcje':
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
              break
            case 'stop':
              await queue.stop(voiceChannel)
              embed.setColor('Red').setDescription('Kolejka została zatrzymana')
              return interaction.reply({embeds: [embed], ephemeral: true})
              break
            case 'pause':
              await queue.pause(voiceChannel)
              embed
                .setColor('Orange')
                .setDescription('Piosenka została wstrzymana')
              return interaction.reply({embeds: [embed], ephemeral: true})
              break
            case 'resume':
              await queue.pause(voiceChannel)
              embed
                .setColor('Green')
                .setDescription('Piosenka została wznowiona')
              return interaction.reply({embeds: [embed], ephemeral: true})
              break
            case 'queue':
              embed
                .setColor('Purple')
                .setDescription(
                  `${queue.songs.map(
                    (song, id) =>
                      `\n**${id + 1}.** ${song.name} -\`${
                        song.formattedDuration
                      }`,
                  )}`,
                )
              return interaction.reply({embeds: [embed], ephemeral: true})
              break
          }

          break
      }
    } catch (error) {
      console.log(error)
      embed.setColor('Red').setDescription('Coś poszło nie tak')
      return interaction.reply({embeds: [embed], ephemeral: true})
    }
  },
}
