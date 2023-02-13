const {SlashCommandBuilder} = require('@discordjs/builders')
const {
  ButtonBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  PermissionsBitField,
  ActivityType,
} = require('discord.js')
const {updateVar} = require('../modules/message_listener.js')
const {defaultEmbed} = require('../modules/embedupdater')
const updateStatus = require('../../index')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createchannel')
    .setDefaultPermission(false)
    .setDescription('Tworzy kanał odtwarzacza'),
  run: async ({interaction, db}) => {
    await interaction.guild.channels
      .create({
        name: 'dj_blyatman',
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ],
      })
      .then(async (channel) => {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('play_pause')
            .setLabel('⏯️')
            .setStyle('Secondary'),
          new ButtonBuilder()
            .setCustomId('skip_song')
            .setLabel('⏭')
            .setStyle('Secondary'),
          new ButtonBuilder()
            .setCustomId('stop_song')
            .setLabel('⏹')
            .setStyle('Secondary'),
          new ButtonBuilder()
            .setCustomId('shuffle_song')
            .setLabel('🔀')
            .setStyle('Secondary'),
          new ButtonBuilder()
            .setCustomId('repeat_song')
            .setLabel('🔁')
            .setStyle('Secondary'),
        )
        let mess = await channel.send({
          embeds: [defaultEmbed],
          components: [row],
        })

        let embed = new EmbedBuilder()
        embed.setDescription(`Utworzono nowy kanał <#${channel.id}>`)
        await interaction.editReply({
          embeds: [embed],
        })
        /*         await db.run(
          `INSERT INTO data(guild, channel, message) VALUES("${mess.guildId}", "${channel.id}", "${mess.id}") ON CONFLICT(guild) DO UPDATE SET channel="${channel.id}", message="${mess.id}"`,
        )
 */
        await db.run(
          `INSERT INTO data(guild, channel, message) VALUES("${mess.guildId}", "${channel.id}", "${mess.id}") ON CONFLICT(guild) DO UPDATE SET channel="${channel.id}", message="${mess.id}"`,
        )
        console.log(`Stworzenie kanału dla: ${mess.guildId}`)
        updateVar(mess.guildId, mess.id, channel.id)
        updateStatus()
      })
    //created channel id //  console.log(channel.id)
  },
}
