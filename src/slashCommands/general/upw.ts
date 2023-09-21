import { SlashCommand } from '../../types'
import {
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js'

import ActivityMonitoringSchema from '../../models/MonitoringActivityModel'

const { SUIVI_ACTIVITY_CHANNEL_ID } = process.env

export const command: SlashCommand = {
  name: 'upw',
  data: new SlashCommandBuilder()
    .setName('upw')
    .setDescription('Permet de déclarer un remplissage UPW.'),
  execute: async (interaction: CommandInteraction) => {
    try {
      const channel = interaction.guild.channels.cache.get(
        SUIVI_ACTIVITY_CHANNEL_ID,
      ) as TextChannel

      const message = await channel.send(
        `⚡ Livraison UPW : Remplissage de la borne`,
      )

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
          name: 'UPW',
          number: 0,
        },
      }).save()
      await interaction.reply({
        content: 'Le remplissage UPW a bien été déclaré !',
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
