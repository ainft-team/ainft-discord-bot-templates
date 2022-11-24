import { Message } from 'discord.js';
import { AinftFactory } from '../services/AinftFactory';

export const messageCreate = () => ({
  name: 'messageCreate',
  execute: async (message: Message, ainftFactory: AinftFactory) => {
    const { id, channelId, guildId, content, author } = message;
    if (author.bot || !guildId || !channelId) return;

    const taskConfig = ainftFactory.getTaskConfigAtChannel(guildId, channelId);
    if (!taskConfig) return;
    const task = Object.values(taskConfig)[0];
    const result = await ainftFactory.addEventActivity(task, author.id, id, content);
    if (result === true) {
      await message.reply('Nice! :thumbsup:');
    } else {
      await message.reply(`${result.error ? result.error + ' :confounded:' : "That didn't work. Try again? :face_with_monocle:"}`);
    }
  },
});
