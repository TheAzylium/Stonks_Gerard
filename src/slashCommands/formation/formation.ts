import { SlashCommand } from '../../types';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';

import FormationSchema, { FORMATION } from '../../models/FormatationModel';

const { FORMATION_CHANNEL_ID, STAGIAIRE_ROLE_ID } = process.env;

export const command: SlashCommand = {
  name: 'formation',
  data: new SlashCommandBuilder()
    .setName('formation')
    .setDescription('Permet de commencer la formation.')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à former')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('phone')
        .setDescription('Numéro de téléphone du membre au format 555-XXXX')
        .setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    try {
      const target = interaction.options.getUser('membre');
      const nicknameTarget = (await interaction.guild.members.fetch(target.id))
        .nickname;
      const phone: string = interaction.options.get('phone').value?.toString();

      // Check si il respect le format de 555-XXXX ou X = 0-9
      if (phone && !phone.match(/555-\d{4}/)) {
        return await interaction.reply({
          content: 'Le numéro de téléphone doit être au format 555-XXXX !',
          ephemeral: true,
        });
      }

      // Check si le membre est déjà dans la base de donnée

      const targetUser: FORMATION = await FormationSchema.findOne({
        discordId: target.id,
      })
        .select('_id messageId')
        .lean();
      if (targetUser) {
        const guildId = interaction.guildId;
        const linkToMessage = `https://discord.com/channels/${guildId}/${FORMATION_CHANNEL_ID}/${targetUser.messageId}`;
        // Dire que le membre est déjà dans la base de donnée avec le lien du message avec messageId
        return await interaction.reply({
          content:
            'Le membre est déjà dans la base de donnée :' + linkToMessage,
          ephemeral: true,
        });
      } else {
        // const embed = new EmbedBuilder()
        // 	.setAuthor({ name: nicknameTarget, iconURL: target.avatarURL() })
        // 	.setTitle('En formation')
        // 	.setDescription(phone)
        // 	.setColor('#00ff00')
        // 	.setTimestamp();

        const row: ActionRowBuilder = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('add_formation')
            .setLabel('Ajouter une formation')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('remove_formation')
            .setLabel('Retirer une formation')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('change_rank')
            .setLabel('Changer de grade')
            .setStyle(ButtonStyle.Success),
        );

        const message = await (
          interaction.guild.channels.cache.get(
            FORMATION_CHANNEL_ID,
          ) as TextChannel
        ).send({
          content: `__En formation__ :  **${nicknameTarget}** ♦${phone}♦`,
          components: [row as any],
        });

        await new FormationSchema({
          discordId: target.id,
          messageId: message.id,
          role: {
            _id: STAGIAIRE_ROLE_ID,
            name: 'En formation',
          },
          formations: [],
        }).save();

        return await interaction.reply({
          content: 'Le membre est maintenant en formation !',
          ephemeral: true,
        });
      }
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: 'An error occurred while processing the command.',
        ephemeral: true,
      });
    }
  },
};
