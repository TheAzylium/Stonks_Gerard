import { Buttons } from '../../../types';
const wait = require('node:timers/promises').setTimeout;
import UserSchema, { USER } from '../../../models/UserModel';

export const button: Buttons = {
  data: {
    name: 'cancel_holidays',
  },
  execute: async interaction => {
    const messageInteractionId = interaction.message.id;

    const user: USER = await UserSchema.findOneAndUpdate(
      {
        'rh_channel': interaction.channelId,
        'vacations.embed_message_id': messageInteractionId,
      },
      {
        $pull: {
          vacations: {
            embed_message_id: messageInteractionId,
          },
        },
      },
      { new: true },
    ).lean();

    if (!user) {
      return await interaction.reply({
        content: "L'utilisateur n'a pas de demande de congés en attente !",
        ephemeral: true,
      });
    }

    const message =
      await interaction.channel.messages.fetch(messageInteractionId);

    await message.delete();

    await interaction.reply({
      content: 'La demande de congés a été annulée !',
      ephemeral: true,
    });
    await wait(5000);
    await interaction.deleteReply();
  },
};

export default button;
