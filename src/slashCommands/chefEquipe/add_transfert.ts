import { SlashCommand } from '../../types';
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EntrepriseList } from '../../const/Entreprise';
import dayjs from 'dayjs';
import OrderOfTheDaySchema, { ORDER_OF_THE_DAY } from '../../models/OrderOfTheDayModel';

export const command: SlashCommand = {
	name: 'addtransfert',
	data: new SlashCommandBuilder()
		.setName('addtransfert')
		.setDescription('Permet d\'ajouter un transfert')

		.addStringOption((option) =>
			option
				.setName('entreprise')
				.setDescription('Entreprise du transfert')
				.setRequired(true)
				.addChoices(...EntrepriseList.map(entreprise => ({
					name: entreprise.name,
					value: entreprise.accronyme
				}))))
		.addStringOption((option) =>
			option
				.setName('jour')
				.setDescription('Jour du transfert (format JJ/MM/YYYY)')
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('heure')
				.setDescription('Heure du transfert (format HH:MM)')
				.setRequired(true)
		),
	execute: async (interaction: CommandInteraction) => {
		const entreprise = interaction.options.get('entreprise').value;
		const jour: string = interaction.options.get('jour').value.toString();
		const heure: string = interaction.options.get('heure').value.toString();

		// check format jour
		if (jour && !jour.match(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/)) {
			return await interaction.reply({
				content: 'Le format du jour est incorrect !',
			});
		}
		if (heure && !heure.match(/^([01]\d|2[0-3]):?([0-5]\d)$/)) {
			return await interaction.reply({
				content: 'Le format de l\'heure est incorrect !',
			});
		}

		const startDate = dayjs(dayjs(jour, 'DD/MM/YYYY').toDate().setHours(0, 0, 0, 0)).toISOString();
		const endDate = dayjs(dayjs(jour, 'DD/MM/YYYY').toDate().setHours(23, 59, 59, 999)).toISOString();

		const OrderOfTheDay: ORDER_OF_THE_DAY = await OrderOfTheDaySchema.findOne({
			day: {
				$gte: startDate,
				$lte: endDate
			}
		}).lean();

		if (OrderOfTheDay) {
			const isHourAlreadyTaken = OrderOfTheDay.missions.some(mission => {
				return mission.hour === heure
			})
			if (isHourAlreadyTaken) {
				return await interaction.reply({
					content: 'L\'heure est déjà prise !',
				});
			}
		}

		let updateOrderOfTheDay: ORDER_OF_THE_DAY;
		if (!OrderOfTheDay) {
			updateOrderOfTheDay = await OrderOfTheDaySchema.create({
				day: dayjs(jour, 'DD/MM/YYYY').toDate().setHours(12, 30, 60, 500),
				missions: [
					{
						target: entreprise,
						type: 'TRANSFERT',
						hour: heure,
					}
				]
			})
		} else {
			updateOrderOfTheDay = await OrderOfTheDaySchema.findOneAndUpdate({
				_id: OrderOfTheDay._id,
			}, {
				$push: {
					missions: {
						target: entreprise,
						type: 'SAISIE',
						hour: heure,
					}
				}
			}).lean()
		}

		if (updateOrderOfTheDay.embed_private_message_id) {

		} else {

			const embed = new EmbedBuilder()
				.setTitle(`Ordre du jour du  ${dayjs(updateOrderOfTheDay.day).format('DD/MM/YYYY')}`)
				.setFooter({ text: 'Ordre du jour'})
				.setTimestamp()
				.setColor('#0099ff')
				.addFields({ value: '🚎 Transfert(s) entreprise(s) 🚎', name: ' '})
				.addFields({value: '●▬▬▬▬●<:stonk:1150105029353685205>●▬▬▬▬●●▬▬▬▬●<:stonk:1150105029353685205>●▬▬▬▬●', name: ' '})
			updateOrderOfTheDay.missions.forEach(mission => {
				if (mission.type === 'TRANSFERT') {
					embed.addFields({ name: `${mission.hour} - ${mission.target}`, value: ' ' })
				} else if (mission.type === 'SAISIE') {
					embed.addFields({ name: `${mission.hour} - ${mission.target}`, value: ' ' })
				} else if (mission.type === 'SECURITY') {
					embed.addFields({ name: `${mission.hour} - ${mission.target}`, value: ' ' })
				}
			})
			embed.addFields({value: '●▬▬▬▬●<:stonk:1150105029353685205>●▬▬▬▬●●▬▬▬▬●<:stonk:1150105029353685205>●▬▬▬▬●', name: ' '})
				.addFields({ value: '🏧 Remplissage ATM entreprises en dessous de 10.000$ <:gtamoney:1150468326011711548>', name: ' '})



			const sentMessage = await interaction.channel?.send({ embeds: [embed] });


			// add button

			const embedId = sentMessage?.id;
		}

		return await
			interaction.reply({
				content: 'En cours de dev'

			})

	}

}
