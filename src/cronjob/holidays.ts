import dayjs from 'dayjs';
import UserModel, { USER } from '../models/UserModel';
import { Client } from 'discord.js';
import { rolesMap } from '../const/rolesManager';

export async function update_holidays(client: Client) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  if (!guild) return console.log('❌ Guild not found');

  const today = dayjs();

  const userInVacation: USER[] = await UserModel.find({
    'vacations.status': 'accepted',
    '$and': [
      { 'vacations.startDate': { $lte: today.toDate() } },
      { 'vacations.endDate': { $gte: today.toDate() } },
    ],
  }).lean();
  const userInVacationIds = userInVacation.map(user => user.discordId);

  const listMembers = await guild.members.fetch();
  listMembers.forEach(member => {
    if (userInVacationIds.includes(member.id)) {
      member.roles.add(rolesMap.get('conge')!);
    } else {
      member.roles.remove(rolesMap.get('conge')!);
    }
  });
}
