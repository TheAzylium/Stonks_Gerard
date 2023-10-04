import { BotEvent } from '../types';
import { Client, Events } from 'discord.js';
import mongoose from 'mongoose';
import { update_holidays } from '../cronjob/holidays';
import { CronJob } from 'cron';
import { order_of_the_days } from '../cronjob/order_of_the_days';
import { generate_frequence_cron } from '../cronjob/radio';

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    await mongoose.connect(process.env.MONGODB_URI);
    if (mongoose.connect) {
      console.log('🗄️ Connected to MongoDB');
    } else {
      console.log('❌ Error while connecting to MongoDB');
    }
    console.log(`💪 Logged in as ${client.user?.tag}`);
    await update_holidays(client);
    await order_of_the_days(client);
    await generate_frequence_cron(client);
    const job = new CronJob(
      '0 9 * * *',
      async () => {
        await update_holidays(client);
        await order_of_the_days(client);
        await generate_frequence_cron(client);
      },
      null,
      true,
      'Europe/Paris',
    );

    job.start();
  },
};

export default event;
