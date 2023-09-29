import { BotEvent } from '../types';
import { Events, MessageReaction, PermissionsBitField, User } from 'discord.js';
import { rolesMap } from '../const/rolesManager';
import { channelMap } from '../const/channelManager';
import UserSchema, { USER } from '../models/UserModel';
import { Formation } from '../const/Formation';

const event: BotEvent = {
  name: Events.MessageReactionAdd,
  once: false,
  async execute(reaction: MessageReaction, user: User) {
    if (reaction.message.channel.id === channelMap.get('suivi-formation')) {
      const roles = [
        rolesMap.get('formateur'),
        rolesMap.get('administrateur'),
        rolesMap.get('head_security'),
      ];
      const member = reaction.message.guild.members.cache.get(user.id);
      if (
        !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
        !member.roles.cache.some(role => roles.includes(role.id))
      ) {
        // remove the reaction
        await reaction.users.remove(user.id);
        return;
      }

      const messageId = reaction.message.id;
      const formationUser: USER = await UserSchema.findOne({
        message_id_formation: messageId,
      }).lean();
      const formationByEmoji = Formation.find(
        formation => formation.emoji === reaction.emoji.name,
      );

      if (formationUser) {
        const completedFormationIds = formationUser.formations.map(f => f._id);
        if (!completedFormationIds.includes(formationByEmoji._id)) {
          await UserSchema.findOneAndUpdate(
            {
              message_id_formation: messageId,
            },
            {
              $push: {
                formations: formationByEmoji,
              },
            },
          );
        }
      }
    } else {
      console.log('other');
    }
  },
};

export default event;
