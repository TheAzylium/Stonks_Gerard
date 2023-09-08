import { SlashCommand } from '../types';
import {
	SlashCommandBuilder,
	ChannelType,
	PermissionsBitField,
	User,
	EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextChannel,
} from 'discord.js';

import UserSchema from '../models/UserModel';

const {
	MAN_ID,
	WOMAN_ID,
	AGENT_ROLE_ID,
	STAGIAIRE_ROLE_ID,
	RH_CATEGORY_ID,
	RH_ROLE_ID,
	ADMIN_ROLE_ID,
	HS_ROLE_ID,
} = process.env;

export const command: SlashCommand = {
	name: 'hiring',
	data: new SlashCommandBuilder()
		.setName('hiring')
		.setDescription('Permet de recruter le mec @ et créer son espace RH.')
		.addUserOption(option => option.setName('membre').setDescription('Membre à recruter').setRequired(true))
		.addRoleOption(option => option.setName('sexe').setDescription('Sexe du membre').setRequired(true)),
	execute: async (interaction) => {
		try {
			const memberUser: User = interaction.options.getUser('membre');
			const genderRole = interaction.options.get('sexe').role;
			if (![MAN_ID, WOMAN_ID].includes(genderRole.id)) {
				return await interaction.reply({ content: 'Le sexe doit être un homme ou une femme !', ephemeral: true });
			}
			await interaction.guild.members.cache.get(memberUser.id).roles.add([genderRole.id, AGENT_ROLE_ID, STAGIAIRE_ROLE_ID]);
			const [firstName, lastName] = (await interaction.guild.members.fetch(memberUser.id)).nickname.split(' ');
			const channelName = genderRole.id === MAN_ID ? `👨•${firstName}-${lastName}` : `👩•${firstName}-${lastName}`;
			const channel = await interaction.guild.channels.create({
				name: channelName,
				type: ChannelType.GuildText,
				parent: RH_CATEGORY_ID,
				permissionOverwrites: [
					{ id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
					{ id: memberUser.id, allow: [PermissionsBitField.Flags.ViewChannel] },
					{ id: RH_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
					{ id: ADMIN_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
					{ id: HS_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
				],
			});

			await createUserSchema(memberUser, channel, firstName, lastName);
			await sendEmbedMessage(channel, memberUser, firstName, lastName);

			await interaction.reply({ content: `Le channel ${channel} a été créé !` });
		}
		catch (e) {
			console.error(e);
			await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
		}
	},
};

async function createUserSchema(memberUser: User, channel: TextChannel, firstName: string, lastName: string) {
	return await UserSchema.create({
		discordId: memberUser.id,
		rh_channel: channel.id,
		lastname: lastName,
		firstName: firstName,
		phone: '555-XXXX',
		hiringDate: Date.now(),
		accountNumber: '___Z____T___',
		role: {
			_id: STAGIAIRE_ROLE_ID,
			name: 'En Formation',
		},
		pole: 'Opérationnel',
		number_weapon: 0,
		last_medical_visit: Date.now(),
	});
}

async function sendEmbedMessage(channel: TextChannel, memberUser: User, firstName: string, lastName: string) {
	const embed = new EmbedBuilder()
		.setAuthor({ name: 'Gerard' })
		.setTitle('Bienvenue dans ton espace RH !')
		.addFields(
			{ name: 'Nom', value: lastName },
			{ name: 'Prénom', value: firstName },
			{ name: 'Téléphone', value: '555-XXXX' },
			{ name: 'Date Embauche', value: 'XX/XX/XXXX' },
			{ name: 'Numéro de compte', value: '___Z____T___' },
			{ name: 'Poste', value: 'En Formation' },
			{ name: 'Pôle ', value: 'Opérationnel' },
			{ name: 'Matricule arme', value: 'XX' },
		)
		.setThumbnail(memberUser.displayAvatarURL())
		.setColor('#ff8e4d');

	const row :any = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Modifier').setCustomId('edit_user'),
			new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Licencier').setCustomId('fire_user'),
		);

	return await channel.send({ embeds: [embed], components: [row] });
}
