import { Client } from 'discord.js';
import { AinftFactory } from '../services/AinftFactory';
import { TaskConfig } from '../types';

export const ready = () => {
  return {
    name: 'ready',
    execute: async (client: Client, ainftFactory: AinftFactory) => {
      console.log(`Ready! Logged in as ${client?.user?.tag}`);

      await client.guilds.fetch();

      await Promise.all(
        client.guilds.cache.map(async (guild) => {
          console.log(guild.id, guild.name, ainftFactory.appId);
          ainftFactory.loadTaskConfig(guild.id);
        })
      )
    },
  };
};
