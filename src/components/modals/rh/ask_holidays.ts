import { Modals } from '../../../types';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import UserSchema from '../../../models/UserModel';
import dayjs from 'dayjs';
const wait = require('node:timers/promises').setTimeout;

export const modals: Modals = {
  data: {
    name: 'ask_holidays',
  },
  execute: async (interaction: ModalSubmitInteraction) => {
    const startDate = interaction.fields.getTextInputValue('start-date');
    const endDate = interaction.fields.getTextInputValue('end-date');
    const reason = interaction.fields.getTextInputValue('reason');

    if (startDate && !startDate.match(/\d{2}[/]\d{2}[/]\d{4}/)) {
      return await interaction.reply({
        content: 'La date de début doit être au format DD/MM/YYYY !',
        ephemeral: true,
      });
    }
    if (endDate && !endDate.match(/\d{2}[/]\d{2}[/]\d{4}/)) {
      return await interaction.reply({
        content: 'La date de fin doit être au format DD/MM/YYYY !',
        ephemeral: true,
      });
    }
    // check if startDate and  EndDate are a plausible date not a 35/99/1905

    if (dayjs(startDate, 'DD/MM/YYYY').isAfter(dayjs(endDate, 'DD/MM/YYYY'))) {
      return await interaction.reply({
        content: 'La date de début doit être avant la date de fin !',
        ephemeral: true,
      });
    }

    if (dayjs(startDate, 'DD/MM/YYYY').isSame(dayjs(endDate, 'DD/MM/YYYY'))) {
      return await interaction.reply({
        content: 'La date de début et de fin ne peuvent pas être les mêmes !',
        ephemeral: true,
      });
    }

    if (!dayjs(startDate, 'DD/MM/YYYY').isValid()) {
      return await interaction.reply({
        content: "La date de début n'est pas valide !",
        ephemeral: true,
      });
    }
    if (!dayjs(endDate, 'DD/MM/YYYY').isValid()) {
      return await interaction.reply({
        content: "La date de fin n'est pas valide !",
        ephemeral: true,
      });
    }

    const updatedByNickname = (
      await interaction.guild.members.fetch(interaction.user.id)
    ).nickname;
    const vacation = {
      startDate: dayjs(startDate, 'DD/MM/YYYY').toDate(),
      endDate: dayjs(endDate, 'DD/MM/YYYY').toDate(),
      reason: reason,
      status: 'pending',
      updatedBy: updatedByNickname,
      embed_message_id: '',
    };

    const embed = generateEmbed({
      status: vacation.status,
      updatedBy: vacation.updatedBy,
      startDate: vacation.startDate,
      endDate: vacation.endDate,
      reason: vacation.reason,
    });

    const buttons = generateButtons();

    // send message to same channel
    const message = await interaction.channel.send({
      embeds: [embed],
      components: [buttons],
    });

    vacation.embed_message_id = message.id;

    await UserSchema.updateOne(
      { rh_channel: interaction.channelId },
      {
        $push: {
          vacations: vacation,
        },
      },
    ).lean();

    await interaction.reply({
      content: 'La demande de congé à été envoyé!',
      ephemeral: true,
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default modals;

export function generateEmbed({
  status,
  updatedBy,
  startDate,
  endDate,
  reason,
}) {
  let statusColor = '#e76330';
  let tradStatus = 'En attente';
  switch (status) {
    case 'pending':
      statusColor = '#e76330';
      tradStatus = 'En attente';
      break;
    case 'accepted':
      statusColor = '#8EFF55';
      tradStatus = 'Accepté';
      break;
    case 'refused':
      statusColor = '#FF0000';
      tradStatus = 'Refusé';
      break;
  }
  const embed = new EmbedBuilder().setColor(statusColor as any).addFields(
    {
      name: 'Date de début',
      value: dayjs(startDate).format('DD/MM/YYYY'),
      inline: true,
    },
    {
      name: 'Date de fin',
      value: dayjs(endDate).format('DD/MM/YYYY'),
      inline: true,
    },
    {
      name: 'Raison',
      value: reason || ' ',
    },
  );

  switch (status) {
    case 'pending':
      embed.setTitle('Demande de congés');
      break;
    case 'accepted':
      embed.setTitle('Congé accepté');
      embed.setFooter({
        text: `${tradStatus} par ${updatedBy} le ${dayjs().format(
          'DD/MM/YYYY à HH:mm',
        )}`,
      });
      break;
    case 'refused':
      embed.setTitle('Congé refusé');
      embed.setFooter({
        text: `${tradStatus} par ${updatedBy} le ${dayjs().format(
          'DD/MM/YYYY à HH:mm',
        )}`,
      });
  }

  return embed;
}

function generateButtons() {
  const row: any = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accept_holidays')
      .setLabel('Accepter')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('refuse_holidays')
      .setLabel('Refuser')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('cancel_holidays')
      .setLabel('Annuler')
      .setStyle(ButtonStyle.Secondary),
  );
  return row;
}
