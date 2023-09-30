import { SlashCommand } from '../../types';
import {
  ActionRowBuilder,
  CommandInteraction,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

export const command: SlashCommand = {
  name: 'addtransfert',
  data: new SlashCommandBuilder()
    .setName('addtransfert')
    .setDescription("Permet d'ajouter un transfert"),

  execute: async (interaction: CommandInteraction) => {
    const modal = new ModalBuilder()
      .setTitle('Ajouter un transfert')
      .setCustomId('add_transfert');

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('Nom')
      .setPlaceholder('Nom')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const typeInput = new TextInputBuilder()
      .setCustomId('type')
      .setLabel('Type')
      .setPlaceholder('Type')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const priceInput = new TextInputBuilder()
      .setCustomId('price')
      .setLabel('Prix')
      .setPlaceholder('Prix sans le $')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const hourInput = new TextInputBuilder()
      .setCustomId('hour')
      .setLabel('Heure')
      .setPlaceholder('Heure format HHhmm')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const nameRow = new ActionRowBuilder().addComponents(nameInput);
    const typeRow = new ActionRowBuilder().addComponents(typeInput);
    const priceRow = new ActionRowBuilder().addComponents(priceInput);
    const hourRow = new ActionRowBuilder().addComponents(hourInput);

    modal.addComponents(
      nameRow as any,
      typeRow as any,
      priceRow as any,
      hourRow as any,
    );
    await interaction.showModal(modal);
  },
};
