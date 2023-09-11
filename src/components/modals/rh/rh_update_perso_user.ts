import { Modals } from '../../../types';
import { ModalSubmitInteraction } from 'discord.js';
import UserSchema, { USER } from '../../../models/UserModel';
import { sendEmbedMessage } from '../../../slashCommands/rh/hiring';
import dayjs from 'dayjs';
const wait = require('node:timers/promises').setTimeout;

export const modals: Modals = {
  data: {
    name: 'edit_perso_user',
  },
  execute: async (interaction: ModalSubmitInteraction) => {
    const name = interaction.fields.getTextInputValue('name');
    const phone = interaction.fields.getTextInputValue('phone') || undefined;
    const accountNumber =
      interaction.fields.getTextInputValue('account-number') || undefined;

    if (phone && !phone.match(/555-\d{4}/)) {
      return await interaction.reply({
        content: 'Le numéro de téléphone doit être au format 555-XXXX !',
        ephemeral: true,
      });
    }

    if (accountNumber && !accountNumber.match(/\d{3}[Z]\d{4}[T]\d{3}/)) {
      return await interaction.reply({
        content: 'Le numéro de compte doit être au format XXXZXXXXTXXX !',
        ephemeral: true,
      });
    }

    const user: USER = await UserSchema.findOneAndUpdate(
      { rh_channel: interaction.channelId },
      {
        name: name,
        phone: phone,
        accountNumber: accountNumber,
        updatedBy: interaction.user.id,
      },
      { new: true },
    ).lean();

    const memberUser = await interaction.guild.members.fetch(user.discordId);
    const updatedBy = (await interaction.guild.members.fetch(user.updatedBy))
      .nickname;

    const newEmbed = await sendEmbedMessage(memberUser.user, {
      name: user.name,
      phone: user.phone,
      accountNumber: user.accountNumber,
      role: user.role?.name,
      pole: user.pole?.name,
      number_weapon: user.number_weapon?.toString(),
      hiringDate: user.hiringDate
        ? dayjs(user.hiringDate).format('DD/MM/YYYY')
        : ' ',
      lastMedicalVisit: user.hiringDate
        ? dayjs(user.last_medical_visit).format('DD/MM/YYYY')
        : ' ',
      nextMedicalVisit: user.hiringDate
        ? dayjs(user.next_medical_visit).format('DD/MM/YYYY')
        : ' ',
      updatedBy: updatedBy,
    });
    const message: any = await interaction.channel.messages.fetch(
      user.embed_message_id,
    );
    await message.edit({ embeds: [newEmbed.embed] });

    await interaction.reply({
      content: 'Les informations personnelles ont été mises à jour !',
      ephemeral: true,
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default modals;
