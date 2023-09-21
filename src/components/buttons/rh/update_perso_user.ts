import { Buttons } from '../../../types';
const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
import UserSchema, { USER } from '../../../models/UserModel';
import { rolesMap } from '../../../const/rolesManager';
import { PermissionsBitField } from 'discord.js';
export const button: Buttons = {
  data: {
    name: 'edit_perso_user',
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

    modal.addComponents(nameRow, phoneRow, accountNumberRow);
    await interaction.showModal(modal);
  },
};

export default button;
