import { SlashCommand } from '../../types';
import {
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';

import ActivityMonitoringSchema from '../../models/MonitoringActivityModel';
import { rolesMap } from '../../const/rolesManager';
import { channelMap } from '../../const/channelManager';

export const command: SlashCommand = {
  name: 'warning',
  data: new SlashCommandBuilder()
    .setName('warning')
    .setDescription('Permet de déclarer un futur manquement de quelque chose.')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de manquement')
        .setRequired(true)
        .addChoices(
          {
            name: 'Tenue',
            value: 'tenue',
          },
          {
            name: 'GPB',
            value: 'gpb',
          },
        ),
    )
    .addNumberOption(option =>
      option
        .setName('nombre')
        .setDescription('Nombre de manquement')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    try {
      if (
        !interaction.guild.members.cache
          .get(interaction.user.id)
          .roles.cache.some(role => role.id === rolesMap.get('agent'))
      ) {
        return await interaction.reply({
          content: "Vous n'avez pas la permission de faire cette commande !",
          ephemeral: true,
        });
      }
      const type: string = interaction.options.get('type').value.toString();
      const nombre: number = parseInt(
        interaction.options.get('nombre').value?.toString(),
      );

      if (nombre < 0) {
        return await interaction.reply({
          content: 'Le nombre doit être positif !',
          ephemeral: true,
        });
      }

      const channel = interaction.guild.channels.cache.get(
        channelMap.get('suivi-activite'),
      ) as TextChannel;

      let textMessage: string;
      if (type === 'tenue') {
        textMessage = `⚠️ ${nombre} tenues restantes`;
      } else {
        textMessage = `⚠️ ${nombre} GPB restants`;
      }

      const message = await channel.send(textMessage);

      const nicknameSender = (
        await interaction.guild.members.fetch(interaction.user.id)
      ).nickname;

      await new ActivityMonitoringSchema({
        messageId: message.id,
        sendBy: {
          _id: interaction.user.id,
          name: nicknameSender,
        },
        activity: {
          name: type === 'tenue' ? 'MISSINGTENUE' : 'MISSINGGILET',
          number: 0,
        },
      }).save();
      await interaction.reply({
        content: 'Le message a bien été envoyé !',
        ephemeral: true,
      });
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: 'An error occurred while processing the command.',
        ephemeral: true,
      });
    }
  },
};
