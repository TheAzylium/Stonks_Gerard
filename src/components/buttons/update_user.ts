import { Buttons } from '../../types';
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
import UserSchema, { USER } from '../../models/UserModel';
const dayjs = require('dayjs')

export const button: Buttons = {
	data: {
		name: 'edit_user',
	},
	execute: async (interaction) => {
		const channelId = interaction.channelId;

		const user: USER = await UserSchema.findOne({ rh_channel: channelId }).lean();


		const modal = new ModalBuilder()
			.setTitle('Modifier les informations de l\'utilisateur')
			.setCustomId('update_user');
		const firtsNameInput = new TextInputBuilder()
			.setCustomId('first-name')
			.setLabel('Prénom')
			.setValue(user.firstName)
			.setRequired(true)
			.setStyle(TextInputStyle.Short);

		const lastNameInput = new TextInputBuilder()
			.setCustomId('last-name')
			.setLabel('Nom de famille')
			.setValue(user.lastname)
			.setRequired(true)
			.setStyle(TextInputStyle.Short);

		const phoneInput = new TextInputBuilder()
			.setCustomId('phone')
			.setLabel('Téléphone')
			.setValue(user.phone)
			.setStyle(TextInputStyle.Short);

		const hiringDate = dayjs(user.hiringDate).format('DD/MM/YYYY');

		const hiringDateInput = new TextInputBuilder()
			.setCustomId('hiring-date')
			.setLabel('Date d\'embauche')
			.setValue(hiringDate)
			.setStyle(TextInputStyle.Short);

		const accountNumberInput = new TextInputBuilder()
			.setCustomId('account-number')
			.setLabel('Numéro de compte')
			.setValue(user.accountNumber)
			.setStyle(TextInputStyle.Short);

		const numberWeaponInput = new TextInputBuilder()
			.setCustomId('number-weapon')
			.setLabel('Numéro d\'arme')
			.setValue(user.number_weapon.toString())
			.setStyle(TextInputStyle.Short);

		const lastMedicalVisit = dayjs(user.last_medical_visit).format('DD/MM/YYYY');

		const lastMedicalVisitInput = new TextInputBuilder()
			.setCustomId('last-medical-visit')
			.setLabel('Dernière visite médicale')
			.setValue(lastMedicalVisit)
			.setStyle(TextInputStyle.Short);


		const firstRow = new ActionRowBuilder().addComponents(firtsNameInput);
		const secondRow = new ActionRowBuilder().addComponents(lastNameInput);
		const thirdRow = new ActionRowBuilder().addComponents(phoneInput);
		const fifthRow = new ActionRowBuilder().addComponents(accountNumberInput);

		const fourthRow = new ActionRowBuilder().addComponents(hiringDateInput);
		const sixthRow = new ActionRowBuilder().addComponents(numberWeaponInput);
		const seventhRow = new ActionRowBuilder().addComponents(lastMedicalVisitInput);

		modal.addComponents(firstRow, secondRow, thirdRow, fifthRow);

		await interaction.showModal(modal);
	},

};

export default button;
