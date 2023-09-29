import { Modals } from '../../../types';
import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import UserSchema, { USER } from '../../../models/UserModel';
import { sendEmbedMessage } from '../../../slashCommands/rh/hire';
import dayjs from 'dayjs';
dayjs.extend(require('dayjs/plugin/customParseFormat'));

const wait = require('node:timers/promises').setTimeout;

export const modals: Modals = {
  data: {
    name: 'edit_pro_user',
  },
  execute: async (interaction: ModalSubmitInteraction) => {
    const weapon = interaction.fields.getTextInputValue('weapon');
    const hiringDate =
      interaction.fields.getTextInputValue('hiring-date') || undefined;
    const lastMedicalVisit =
      interaction.fields.getTextInputValue('last-medical-visit') || undefined;
    const nextMedicalVisit =
      interaction.fields.getTextInputValue('next-medical-visit') || undefined;
    // dayjs(, 'DD/MM/YYYY').toDate()
    if (weapon && !weapon.match(/\d{2}/)) {
      return await interaction.reply({
        content: 'Le numéro de matricule doit être au format XX !',
        ephemeral: true,
      });
    }
    if (hiringDate && !hiringDate.match(/\d{2}[/]\d{2}[/]\d{4}/)) {
      return await interaction.reply({
        content: "La date d'embauche doit être au format DD/MM/YYYY !",
        ephemeral: true,
      });
    }
    if (lastMedicalVisit && !lastMedicalVisit.match(/\d{2}[/]\d{2}[/]\d{4}/)) {
      return await interaction.reply({
        content:
          'La date de la dernière visite médicale doit être au format DD/MM/YYYY !',
        ephemeral: true,
      });
    }

    if (nextMedicalVisit && !nextMedicalVisit.match(/\d{2}[/]\d{2}[/]\d{4}/)) {
      return await interaction.reply({
        content:
          'La date de la prochaine visite médicale doit être au format DD/MM/YYYY !',
        ephemeral: true,
      });
    }

    let hiringDateDated: Date,
      lastMedicalVisitDated: Date,
      nextMedicalVisitDated: Date;
    if (hiringDate) {
      hiringDateDated = dayjs(hiringDate, 'DD/MM/YYYY').toDate();
    }
    if (lastMedicalVisit) {
      lastMedicalVisitDated = dayjs(lastMedicalVisit, 'DD/MM/YYYY').toDate();
    }
    if (nextMedicalVisit) {
      nextMedicalVisitDated = dayjs(nextMedicalVisit, 'DD/MM/YYYY').toDate();
    }

    const user: USER = await UserSchema.findOneAndUpdate(
      { rh_channel: interaction.channelId },
      {
        number_weapon: weapon,
        hiringDate: hiringDateDated,
        last_medical_visit: lastMedicalVisitDated,
        next_medical_visit: nextMedicalVisitDated,
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
      updatedBy: updatedBy,
      updatedAt: user.updatedAt,
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

    await interaction.reply({
      content: 'Les informations personnelles ont été mises à jour !',
      ephemeral: true,
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default modals;
