import { Modals } from '../../../types';
import { EmbedBuilder, ModalSubmitInteraction, TextChannel } from 'discord.js';
import UserSchema, { USER } from '../../../models/UserModel';
import { sendEmbedMessage } from '../../../slashCommands/rh/hire';
import dayjs from 'dayjs';
import { channelMap } from '../../../const/channelManager';
import { update_contact } from '../../../const/update_contact';
const wait = require('node:timers/promises').setTimeout;

export const modals: Modals = {
  data: {
    name: 'edit_perso_user',
  },
  execute: async (interaction: ModalSubmitInteraction) => {
    await interaction.deferReply({ ephemeral: true });
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

    if (user.phone) {
      const previousMessageFormation = interaction.guild.channels.cache.get(
        channelMap.get('suivi-formation'),
      );

      if (previousMessageFormation.isTextBased) {
        const previousMessage = await (
          previousMessageFormation as TextChannel
        ).messages.fetch(user.message_id_formation);
        await previousMessage.edit({
          content: `__${user.role.name}__ :  **${memberUser.nickname}** 📞${user.phone}📞`,
        });
      }
    }

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
      updatedBy: updatedBy,
    });

    const newEmbedMedical = new EmbedBuilder()
      .setTitle('Visite médicale')
      .setColor('#8EFF55')
      .setFooter({
        text: `Mis à jour par ${updatedBy} le ${dayjs(user.updatedAt).format(
          'DD/MM/YYYY à HH:mm',
        )}`,
      })
      .addFields(
        {
          name: 'Dernière visite médicale',
          value: user.last_medical_visit
            ? dayjs(user.last_medical_visit).format('DD/MM/YYYY')
            : ' ',
          inline: true,
        },
        {
          name: 'Prochaine visite médicale',
          value: user.next_medical_visit
            ? dayjs(user.next_medical_visit).format('DD/MM/YYYY')
            : ' ',
          inline: true,
        },
      );
    const message: any = await interaction.channel.messages.fetch(
      user.embed_message_id_rh,
    );
    await message.edit({ embeds: [newEmbed.embed, newEmbedMedical] });

    const currentChannelName = interaction.channel.name;

    const emojiCurrentChannelName = currentChannelName.match(/[👨👩]/);

    await interaction.channel.setName(
      `${emojiCurrentChannelName ? emojiCurrentChannelName[0] : ''}・${
        user.name
      }`,
    );

    await update_contact(interaction);

    await interaction.editReply({
      content: 'Les informations personnelles ont été mises à jour !',
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default modals;
