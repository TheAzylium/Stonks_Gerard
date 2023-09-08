// import UserSchema, {USER} from '../../models/UserModel';
// const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
//
// async function edit_user(channelId) {
//   console.log(channelId);
//   const user: USER = await UserSchema.findOne({rh_channel: channelId}).lean();
//   console.log(user)
//
//   const modal = new ModalBuilder()
//     .setTitle('Modifier les informations de l\'utilisateur')
//
//
//   const firstName = new TextInputBuilder().setCustomId('first_name').setPlaceholder('Prénom').setValue(user.firstName).setStyle(TextInputStyle.Short);
//   const lastName = new TextInputBuilder().setCustomId('last_name').setPlaceholder('Nom').setValue(user.lastname).setStyle(TextInputStyle.Short);
//   const phone = new TextInputBuilder().setCustomId('phone').setPlaceholder('Téléphone').setValue(user.phone).setStyle(TextInputStyle.Short);
//
//   const firstActionRow = new ActionRowBuilder().addComponents(firstName, lastName);
//
//   const secondActionRow = new ActionRowBuilder().addComponents(phone);
//
//   modal.addComponents(firstActionRow, secondActionRow);
//
//   return modal
//
// }
//
// export default edit_user;
