import { SlashCommand } from '../../types'
import {
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js'

import ActivityMonitoringSchema from '../../models/MonitoringActivityModel'

const { SUIVI_ACTIVITY_CHANNEL_ID } = process.env

export const command: SlashCommand = {
  name: 'ffs',
  data: new SlashCommandBuilder()
    .setName('ffs')
    .setDescription('Permet de déclarer une livraison FFS.')
    .addNumberOption(option =>
      option
        .setName('nombre')
        .setDescription('Nombre de tenue')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    try {
      const nombre: number = parseInt(
        interaction.options.get('nombre').value?.toString(),
      )

      if (nombre < 0) {
        return await interaction.reply({
          content: 'Le nombre doit être positif !',
          ephemeral: true,
        })
      }

      const channel = interaction.guild.channels.cache.get(
        SUIVI_ACTIVITY_CHANNEL_ID,
      ) as TextChannel

      const message = await channel.send(`🦺 Livraison FFS : ${nombre} tenues`)

      const nicknameSender = (
        await interaction.guild.members.fetch(interaction.user.id)
      ).nickname

      await new ActivityMonitoringSchema({
        messageId: message.id,
        sendBy: {
          _id: interaction.user.id,
          name: nicknameSender,
        },
        activity: {
          name: 'FFS',
          number: 0,
        },
      }).save()
      await interaction.reply({
        content: 'Le remplissage FFS a bien été déclaré !',
        ephemeral: true,
      })
    } catch (e) {
      console.error(e)
      await interaction.reply({
        content: 'An error occurred while processing the command.',
        ephemeral: true,
      })
    }
  },
}
