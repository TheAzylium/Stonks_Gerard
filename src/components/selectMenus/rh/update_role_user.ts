import { SelectMenu } from '../../../types';
import { StringSelectMenuInteraction, TextChannel } from 'discord.js';
import UserSchema, { USER } from '../../../models/UserModel';
import RhHistorySchema from '../../../models/RhHistoryModel';

import dayjs from 'dayjs';
import { PosteList } from '../../../const/RolesList';
import { sendEmbedMessage } from '../../../slashCommands/rh/hire';
import { rolesMap } from '../../../const/rolesManager';
import { channelMap } from '../../../const/channelManager';
dayjs.extend(require('dayjs/plugin/customParseFormat'));

const wait = require('node:timers/promises').setTimeout;

export const modals: SelectMenu = {
  data: {
    name: 'roles_update',
  },
  execute: async (interaction: StringSelectMenuInteraction) => {
    const newRole = {
      _id: interaction.values[0],
      name: PosteList.find(option => option.value === interaction.values[0])
        ?.label,
    };

    const updatedUser: USER = await UserSchema.findOneAndUpdate(
      { rh_channel: interaction.channelId },
      {
        role: newRole,
        updatedBy: interaction.user.id,
      },
      { new: true },
    ).lean();

    const memberUser = await interaction.guild.members.fetch(
      updatedUser.discordId,
    );
    await memberUser.roles.remove(
      memberUser.roles.cache.filter(
        role => role.id !== interaction.guild.roles.everyone.id,
      ),
    );
    const roles = [updatedUser.sex, rolesMap.get('agent')];

    if (updatedUser.pole?._id) {
      roles.push(updatedUser.pole._id);
    }
    if (updatedUser.role?._id) {
      roles.push(updatedUser.role._id);
    }
    await memberUser.roles.set(roles);

    const updatedBy = (
      await interaction.guild.members.fetch(updatedUser.updatedBy)
    ).nickname;

    await RhHistorySchema.create({
      discordId: updatedUser.discordId,
      newRole: newRole,
      updatedBy,
    });

    const newEmbed = await sendEmbedMessage(memberUser.user, {
      name: updatedUser.name,
      phone: updatedUser.phone,
      accountNumber: updatedUser.accountNumber,
      role: updatedUser.role?.name,
      pole: updatedUser.pole?.name,
      number_weapon: updatedUser.number_weapon?.toString(),
      hiringDate: updatedUser.hiringDate
        ? dayjs(updatedUser.hiringDate).format('DD/MM/YYYY')
        : ' ',
      lastMedicalVisit: updatedUser.last_medical_visit
        ? dayjs(updatedUser.last_medical_visit).format('DD/MM/YYYY')
        : ' ',
      nextMedicalVisit: updatedUser.next_medical_visit
        ? dayjs(updatedUser.next_medical_visit).format('DD/MM/YYYY')
        : ' ',
      updatedBy: updatedBy,
    });

    const message: any = await interaction.channel.messages.fetch(
      updatedUser.embed_message_id_rh,
    );
    await message.edit({ embeds: [newEmbed.embed] });

    const previousMessageFormation = await interaction.guild.channels.cache.get(
      channelMap.get('suivi-formation'),
    );

    if (previousMessageFormation.isTextBased) {
      const messageFormation: any = await (
        previousMessageFormation as TextChannel
      ).messages.fetch(updatedUser.message_id_formation);

      const oldContentMessage = messageFormation.content;
      const lastPart = oldContentMessage.split(':').pop();

      await messageFormation.edit({
        content: `__${newRole.name}__ :${lastPart}`,
      });
    }

    await interaction.reply({
      content: 'Le poste à été mis à jour !',
      ephemeral: true,
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default modals;
