import { Modals } from '../../../types';
import { EmbedBuilder, ModalSubmitInteraction, TextChannel } from 'discord.js';
import { channelMap } from '../../../const/channelManager';
import ActivityMonitoringSchema from '../../../models/MonitoringActivityModel';
const wait = require('node:timers/promises').setTimeout;

export const modals: Modals = {
  data: {
    name: 'add_transfert',
  },
  execute: async (interaction: ModalSubmitInteraction) => {
    const name = interaction.fields.getTextInputValue('name');
    const type = interaction.fields.getTextInputValue('type');
    const price = interaction.fields.getTextInputValue('price');
    const hour = interaction.fields.getTextInputValue('hour');
    if (hour && !hour.match(/^([01]\d|2[0-3])h?([0-5]\d)$/)) {
      return await interaction.reply({
        content: "Le format de l'heure est incorrect !",
      });
    }
    const embed = new EmbedBuilder()
      .addFields(
        {
          name: 'Nom',
          value: name,
        },
        {
          name: 'Type',
          value: type,
        },
        {
          name: 'Prix',
          value: `${price} $`,
          inline: true,
        },
        {
          name: 'Heure',
          value: hour,
          inline: true,
        },
      )
      .setColor('#0c460c');

    const channel = interaction.guild.channels.cache.get(
      channelMap.get('suivi-activite'),
    ) as TextChannel;

    const message = await channel.send({ embeds: [embed] });
    const nicknameSender = (
      await interaction.guild.members.fetch(interaction.user.id)
    ).nickname;

    await ActivityMonitoringSchema.create({
      messageId: message.id,
      sendBy: {
        _id: interaction.user.id,
        name: nicknameSender,
      },
      activity: {
        name: type,
        hour: hour,
      },
    });

    await interaction.reply({
      content: 'Transfert enregistré !',
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default modals;
