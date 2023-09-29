import { SelectMenu } from '../../../types';
import { EmbedBuilder, StringSelectMenuInteraction } from 'discord.js';
import UserSchema, { USER } from '../../../models/UserModel';
import RhHistorySchema from '../../../models/RhHistoryModel';

import dayjs from 'dayjs';
import { sendEmbedMessage } from '../../../slashCommands/rh/hire';
import { PoleList } from '../../../const/PolesList';
import { rolesMap } from '../../../const/rolesManager';
import { update_contact } from '../../../const/update_contact';

dayjs.extend(require('dayjs/plugin/customParseFormat'));

const wait = require('node:timers/promises').setTimeout;

export const modals: SelectMenu = {
  data: {
    name: 'poles_update',
  },
  execute: async (interaction: StringSelectMenuInteraction) => {
    await interaction.deferReply({ ephemeral: true });
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
      updatedBy: updatedBy,
    });

    const newEmbedMedical = new EmbedBuilder()
      .setTitle('Visite médicale')
      .setColor('#8EFF55')
      .setFooter({
        text: `Mis à jour par ${updatedBy} le ${dayjs(
          updatedUser.updatedAt,
        ).format('DD/MM/YYYY à HH:mm')}`,
      })
      .addFields(
        {
          name: 'Dernière visite médicale',
          value: updatedUser.last_medical_visit
            ? dayjs(updatedUser.last_medical_visit).format('DD/MM/YYYY')
            : ' ',
          inline: true,
        },
        {
          name: 'Prochaine visite médicale',
          value: updatedUser.next_medical_visit
            ? dayjs(updatedUser.next_medical_visit).format('DD/MM/YYYY')
            : ' ',
          inline: true,
        },
      );

    const message: any = await interaction.channel.messages.fetch(
      updatedUser.embed_message_id_rh,
    );
    await message.edit({ embeds: [newEmbed.embed, newEmbedMedical] });

    await update_contact(interaction);
    await interaction.editReply({
      content: 'Le pôle à été mis à jour !',
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default modals;
