import { SelectMenu } from '../../../types';
import {
  ActionRowBuilder,
  ModalBuilder,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import UserSchema, { USER } from '../../../models/UserModel';

import dayjs from 'dayjs';
import { PoleList } from '../../../const/PolesList';
import { rolesMap } from '../../../const/rolesManager';
import { PosteList } from '../../../const/RolesList';

dayjs.extend(require('dayjs/plugin/customParseFormat'));

const wait = require('node:timers/promises').setTimeout;

async function edit_perso_user(interaction: StringSelectMenuInteraction) {
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
  const channelId = interaction.channelId;

  const user: USER = await UserSchema.findOne({
    rh_channel: channelId,
  }).lean();

  const modal = new ModalBuilder()
    .setTitle("Modifier les informations de l'utilisateur")
    .setCustomId('edit_perso_user');
  const nameInput = new TextInputBuilder()
    .setCustomId('name')
    .setLabel('Nom')
    .setValue(user.name || '')
    .setRequired(true)
    .setStyle(TextInputStyle.Short);
  const phoneInput = new TextInputBuilder()
    .setCustomId('phone')
    .setLabel('Téléphone')
    .setValue(user.phone || '')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('555-XXXX');

  const accountNumberInput = new TextInputBuilder()
    .setCustomId('account-number')
    .setLabel('Numéro de compte')
    .setValue(user.accountNumber || '')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('XXXZXXXXTXXX');

  const nameRow = new ActionRowBuilder().addComponents(nameInput);
  const phoneRow = new ActionRowBuilder().addComponents(phoneInput);
  const accountNumberRow = new ActionRowBuilder().addComponents(
    accountNumberInput,
  );

  modal.addComponents(nameRow as any, phoneRow as any, accountNumberRow as any);
  await interaction.showModal(modal);
}

async function edit_pro_user(interaction: StringSelectMenuInteraction) {
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
  const channelId = interaction.channelId;

  const user: USER = await UserSchema.findOne({
    rh_channel: channelId,
  }).lean();

  const modal = new ModalBuilder()
    .setTitle("Modifier les informations de l'utilisateur")
    .setCustomId('edit_pro_user');
  const weaponInput = new TextInputBuilder()
    .setCustomId('weapon')
    .setLabel('Matricule arme de service')
    .setValue(user.number_weapon?.toString() || '')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);
  const hiringDate: string = user.hiringDate
    ? dayjs(user.hiringDate).format('DD/MM/YYYY') || ''
    : '';
  const hiringDateInput = new TextInputBuilder()
    .setCustomId('hiring-date')
    .setLabel("Date d'embauche")
    .setValue(hiringDate)
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('DD/MM/YYYY');

  const lastMedicalVisit: string = user.last_medical_visit
    ? dayjs(user.last_medical_visit).format('DD/MM/YYYY') || ''
    : '';
  const lastMedicalVisitInput = new TextInputBuilder()
    .setCustomId('last-medical-visit')
    .setLabel('Date de la dernière visite médicale')
    .setValue(lastMedicalVisit)
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('DD/MM/YYYY');

  const nextMedicalVisit: string = user.next_medical_visit
    ? dayjs(user.next_medical_visit).format('DD/MM/YYYY') || ''
    : '';
  const nextMedicalVisitInput = new TextInputBuilder()
    .setCustomId('next-medical-visit')
    .setLabel('Date de la prochaine visite médicale')
    .setValue(nextMedicalVisit)
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('DD/MM/YYYY');

  const weaponRow = new ActionRowBuilder().addComponents(weaponInput);
  const hiringRow = new ActionRowBuilder().addComponents(hiringDateInput);
  const lastMedicalVisitRow = new ActionRowBuilder().addComponents(
    lastMedicalVisitInput,
  );
  const nextMedicalVisitRow = new ActionRowBuilder().addComponents(
    nextMedicalVisitInput,
  );

  modal.addComponents(
    hiringRow as any,
    weaponRow as any,
    lastMedicalVisitRow as any,
    nextMedicalVisitRow as any,
  );
  await interaction.showModal(modal);
}

async function edit_role_user(interaction: StringSelectMenuInteraction) {
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

  const menu = new StringSelectMenuBuilder()
    .setMinValues(1)
    .setMaxValues(1)
    .setCustomId('roles_update')
    .setPlaceholder('Choisissez un rôle')
    .setOptions(PosteList);

  const menuRow = new ActionRowBuilder().addComponents(menu as any);

  await interaction.reply({
    content: 'Choisissez un rôle',
    components: [menuRow as any],
    ephemeral: true,
  });
  await wait(10000);
  await interaction.deleteReply();
}

async function edit_pole_user(interaction: StringSelectMenuInteraction) {
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

  const menu = new StringSelectMenuBuilder()
    .setMinValues(1)
    .setMaxValues(1)
    .setCustomId('poles_update')
    .setPlaceholder('Choisissez un poste')
    .setOptions(PoleList);

  await interaction.reply({
    content: 'Choisissez un poste',
    components: [new ActionRowBuilder().addComponents(menu) as any],
    ephemeral: true,
  });
  await wait(10000);
  await interaction.deleteReply();
}

async function ask_holidays(interaction: StringSelectMenuInteraction) {
  const modal = new ModalBuilder()
    .setTitle('Demande de congés')
    .setCustomId('ask_holidays');

  const startDateInput = new TextInputBuilder()
    .setCustomId('start-date')
    .setLabel('Date de début')
    .setPlaceholder('DD/MM/YYYY')
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

  const endDateInput = new TextInputBuilder()
    .setCustomId('end-date')
    .setLabel('Date de fin')
    .setPlaceholder('DD/MM/YYYY')
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Raison')
    .setPlaceholder('Raison')
    .setRequired(false)
    .setStyle(TextInputStyle.Paragraph);

  const startDateRow = new ActionRowBuilder().addComponents(startDateInput);
  const endDateRow = new ActionRowBuilder().addComponents(endDateInput);
  const reasonRow = new ActionRowBuilder().addComponents(reasonInput);

  modal.addComponents(startDateRow as any, endDateRow as any, reasonRow as any);
  await interaction.showModal(modal);
}
export const modals: SelectMenu = {
  data: {
    name: 'user_action',
  },
  execute: async (interaction: StringSelectMenuInteraction) => {
    switch (interaction.values[0]) {
      case 'edit_perso_user':
        await edit_perso_user(interaction);
        break;
      case 'edit_pro_user':
        await edit_pro_user(interaction);
        break;
      case 'edit_role_user':
        await edit_role_user(interaction);
        break;
      case 'edit_pole_user':
        await edit_pole_user(interaction);
        break;
      case 'ask_holidays':
        await ask_holidays(interaction);
        break;
      default:
        break;
    }
  },
};

export default modals;
