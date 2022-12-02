import { Client } from 'discord.js';
import { AinftFactory } from '../services/ainftFactory';
import { TaskConfig } from '../types';

export const ready = () => {
  return {
    name: 'ready',
    execute: async (client: Client, ainftFactory: AinftFactory) => {
      console.log(`Ready! Logged in as ${client?.user?.tag}`);

      await client.guilds.fetch();

      await Promise.all(
        client.guilds.cache.map(async (guild) => {
          if (!(await ainftFactory.isConnected(guild.id))) {
            await ainftFactory.connectServerToApp(guild.id);
          }
          console.log(guild.id, guild.name, ainftFactory.appId);
          ainftFactory.loadTaskConfig(guild.id);
        })
      )
    },
  };
};
