import { SlashCommand } from '../../types';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EntrepriseList } from '../../const/Entreprise';

export const command: SlashCommand = {
  name: 'rdv',
  data: new SlashCommandBuilder()
    .setName('rdv')
    .setDescription("Permet d'ajouter un rendez-vous")
    .addStringOption(option =>
      option
        .setName('statut')
        .setDescription('Ajouter ou supprimer un rendez-vous')
        .setRequired(true)
        .addChoices(
          {
            name: 'Ajouter',
            value: 'add',
          },
          {
            name: 'Supprimer',
            value: 'del',
          },
        ),
    )
    .addStringOption(option =>
      option
        .setName('entreprise')
        .setDescription('Entreprise ou le nom du particulier')
        .setRequired(true)
        .addChoices(
          ...EntrepriseList.map(entreprise => ({
            name: entreprise.name,
            value: entreprise.accronyme,
          })),
        ),
    )
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de rendez-vous')
        .setRequired(true)
        .addChoices(
          {
            name: 'Transfert Entreprise',
            value: 'transfert_entreprise',
          },
          {
            name: 'Transfert Particulier',
            value: 'transfert_particulier',
          },
          {
            name: 'Revente Particulier',
            value: 'revente_particulier',
          },
          {
            name: 'Saisie',
            value: 'saisie',
          },
          {
            name: 'Réhabilitation de billets',
            value: 'rehabilitation_billets',
          },
          {
            name: 'Autre',
            value: 'autre',
          },
        ),
    )
    .addStringOption(option =>
      option
        .setName('jour')
        .setDescription('Jour de la saisie (format JJ/MM/YYYY)')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('heure')
        .setDescription('Heure de la saisie (format HH:MM)')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    const statut = interaction.options.get('Statut').value;
    const entreprise = interaction.options.get('entreprise').value;
    const type = interaction.options.get('type').value;
    const jour: string = interaction.options.get('jour').value.toString();
    const heure: string = interaction.options.get('heure').value.toString();

    console.log(statut, entreprise, type, jour, heure);
    interaction.reply({
      content: 'En cours de dev',
    });
  },
};
