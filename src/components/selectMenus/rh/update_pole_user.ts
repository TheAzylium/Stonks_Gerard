import { SelectMenu } from '../../../types';
import { StringSelectMenuInteraction } from 'discord.js';
import UserSchema, { USER } from '../../../models/UserModel';
import RhHistorySchema from '../../../models/RhHistoryModel';

import dayjs from 'dayjs';
import { sendEmbedMessage } from '../../../slashCommands/rh/hire';
import { PoleList } from '../../../const/PolesList';

dayjs.extend(require('dayjs/plugin/customParseFormat'));

const wait = require('node:timers/promises').setTimeout;

export const modals: SelectMenu = {
  data: {
    name: 'poles_update',
  },
  execute: async (interaction: StringSelectMenuInteraction) => {
    let newPole: { _id: string; name: string };
    if (interaction.values[0] === '1') {
      newPole = {
        _id: undefined,
        name: 'Opérationnel',
      };
    } else {
      newPole = {
        _id: interaction.values[0],
        name: PoleList.find(option => option.value === interaction.values[0])
          ?.label,
      };
    }
    const updatedUser: USER = await UserSchema.findOneAndUpdate(
      { rh_channel: interaction.channelId },
      {
        pole: newPole,
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
    const roles = [updatedUser.sex, process.env.AGENT_ROLE_ID];

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
      newRole: newPole,
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
      updatedUser.embed_message_id,
    );
    await message.edit({ embeds: [newEmbed.embed] });

    await interaction.reply({
      content: 'Le pôle à été mis à jour !',
      ephemeral: true,
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default modals;
