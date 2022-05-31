const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createchannel')
    .setDefaultPermission(false)
    .setDescription('Tworzy kanał odtwarzacza'),
  run: async ({interaction, db}) => {
    await interaction.guild.channels
      .create('dj_blyatman', {
        type: 'text',
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
        ],
      })
      .then(async (channel) => {
        let mess = await channel.send('Hello!')
        console.log(channel.id)
        console.log(mess.id)
        console.log(mess.guildId)
        let embed = new MessageEmbed()
        embed.setDescription(`Utworzono nowy kanał <#${channel.id}>`)
        await interaction.editReply({
          embeds: [embed],
        })
        await db.run(
          `INSERT INTO data(guild, channel, message) VALUES("${mess.guildId}", "${channel.id}", "${mess.id}") ON CONFLICT(guild) DO UPDATE SET channel="${channel.id}", message="${mess.id}"`,
        )
      })
    //created channel id //  console.log(channel.id)
  },
}
