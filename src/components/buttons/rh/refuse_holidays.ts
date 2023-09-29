import { Buttons } from '../../../types';
import { PermissionsBitField } from 'discord.js';
import { rolesMap } from '../../../const/rolesManager';
const wait = require('node:timers/promises').setTimeout;
import UserSchema, { USER } from '../../../models/UserModel';
import { generateEmbed } from '../../modals/rh/ask_holidays';

export const button: Buttons = {
  data: {
    name: 'refuse_holidays',
  },
  execute: async interaction => {
    const roles = [
      rolesMap.get('rh'),
      rolesMap.get('administrateur'),
      rolesMap.get('head_security'),
    ];
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (
      !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      !member.roles.cache.some(role => roles.includes(role.id))
    ) {
      return await interaction.reply({
        content: "Vous n'avez pas la permission de faire cette commande !",
        ephemeral: true,
      });
    }

    const messageInteractionId = interaction.message.id;

    const user: USER = await UserSchema.findOneAndUpdate(
      {
        'rh_channel': interaction.channelId,
        'vacations.status': 'pending',
        'vacations.embed_message_id': messageInteractionId,
      },
      {
        $set: {
          'vacations.$.status': 'refused',
        },
      },
      { new: true },
    ).lean();

    if (!user) {
      return await interaction.reply({
        content: "L'utilisateur n'a pas de demande de congés en attente !",
        ephemeral: true,
      });
    }

    const vacations = user.vacations.find(
      (vacation: any) => vacation.embed_message_id === messageInteractionId,
    );

    const updatedEmbed = generateEmbed({ status: 'refused', ...vacations });

    const message =
      await interaction.channel.messages.fetch(messageInteractionId);

    // update embed and remove buttons
    await message.edit({ embeds: [updatedEmbed], components: [] });

    await interaction.reply({
      content: 'La demande de congés a été refusée !',
      ephemeral: true,
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default button;
