import { SlashCommand } from '../../types';
import {
  CommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { EntrepriseList } from '../../const/Entreprise';
import { channelMap } from '../../const/channelManager';
import ActivityMonitoringSchema from '../../models/MonitoringActivityModel';
import { rolesMap } from '../../const/rolesManager';
const typeTransfert = [
  {
    name: 'Transfert entreprise',
    value: 'TRANSFERT',
  },
  {
    name: 'Transfert de saisie',
    value: 'SAISIE',
  },
  {
    name: 'Réhabilitation de billets',
    value: 'BILLETS',
  },
  {
    name: 'Transfert sécurisé',
    value: 'SECURISE',
  },
];

export const command: SlashCommand = {
  name: 'addtransfert',
  data: new SlashCommandBuilder()
    .setName('addtransfertpro')
    .setDescription("Permet d'ajouter un transfert")
    .addStringOption(option =>
      option
        .setName('entreprise')
        .setDescription('Entreprise du transfert')
        .setRequired(true)
        .addChoices(
          ...EntrepriseList.map(entreprise => ({
            name: entreprise.name,
            value: entreprise.name,
          })),
        ),
    )
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de transfert')
        .setRequired(true)
        .addChoices(...typeTransfert),
    )
    .addStringOption(option =>
      option
        .setName('heure')
        .setDescription('Heure du transfert (format HHhMM)')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    const roles = [
      rolesMap.get('chef_equipe'),
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

    const entreprise = interaction.options.get('entreprise').value;
    const hour: string = interaction.options.get('heure').value.toString();
    const type = interaction.options.get('type').value;

    if (hour && !hour.match(/^([01]\d|2[0-3])h?([0-5]\d)$/)) {
      return await interaction.reply({
        content: "Le format de l'heure est incorrect !",
      });
    }

    let color = '#00ff00';
    switch (type) {
      case 'TRANSFERT':
        color = '#00ff00';
        break;
      case 'SAISIE':
        color = '#ff0000';
        break;
      case 'BILLETS':
        color = '#0000ff';
        break;
      case 'SECURISE':
        color = '#ff00ff';
        break;
    }

    const embed = new EmbedBuilder()
      .addFields(
        {
          name: '🏢 Entreprise',
          value: entreprise.toString(),
        },
        {
          name: '📃 Type',
          value: typeTransfert.find(t => t.value === type)?.name,
        },
        {
          name: '🕔 Horaire',
          value: hour.toString(),
        },
      )
      .setColor(color as any);

    const channel = interaction.guild.channels.cache.get(
      channelMap.get('suivi-activite'),
    ) as TextChannel;

    const message = await channel.send({ embeds: [embed] });
    const nicknameSender = (
      await interaction.guild.members.fetch(interaction.user.id)
    ).nickname;
    await ActivityMonitoringSchema.create({
      messageId: message.id,
      sendBy: {
        _id: interaction.user.id,
        name: nicknameSender,
      },
      activity: {
        name: type,
        hour: hour,
      },
    });

    return await interaction.reply({
      content: `${typeTransfert.find(t => t.value === type)
        ?.name} pour ${entreprise} ajouté !`,
      ephemeral: true,
    });
  },
};
