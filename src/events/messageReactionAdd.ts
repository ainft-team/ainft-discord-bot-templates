import { MessageReaction, PartialMessageReaction, TextChannel, User } from 'discord.js';
import { NO_EVENT_TASK_CONFIG_AT_CHANNEL } from '../common/constants';
import { AinftFactory } from '../services/AinftFactory';
import { isAdmin } from '../utils';
import { isAinftJsError } from '../utils/error';

export const messageReactionAdd = () => ({
  name: 'messageReactionAdd',
  execute: async (
    reaction: MessageReaction | PartialMessageReaction,
    user: User,
    ainftFactory: AinftFactory,
  ) => {
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Something went wrong when fetching the message:', error);
        // Return as `reaction.message.author` may be undefined/null
        return;
      }
    }
    const { id, channelId, guildId, author, createdTimestamp } = reaction.message;
    const messageUrl = reaction.message.url;
    if (!author || author.bot || user.bot || !guildId || !channelId || !ainftFactory) return;
    const guild = await reaction.client.guilds.fetch(guildId);
    const channel = await reaction.client.channels.fetch(channelId) as TextChannel;
    const reactor = await guild.members.fetch(user.id);
    if (!isAdmin(reactor)) return;
    if (reaction.emoji.name !== '❎') return;

    const activity = await ainftFactory.getActivity(
      guildId,
      channelId,
      author.id,
      createdTimestamp,
      id,
    );
    if (isAinftJsError(activity) && activity.error === NO_EVENT_TASK_CONFIG_AT_CHANNEL) {
      // not a task-related activity
      return;
    }
    if (!activity || isAinftJsError(activity) || !activity.eventId || !activity.id || !activity.createdAt) {
      await channel.send(
        `<@${reactor.id}> Failed to mark the user activity as invalid: ${messageUrl}`
      );
      return;
    }
    const updated = await ainftFactory.updateActivityStatus(
      guildId,
      activity.eventId,
      activity.id,
      activity.createdAt,
      'FAILED',
    );
    if (isAinftJsError(updated)) {
      await channel.send(
        `<@${reactor.id}> Failed to mark the user activity as invalid: ${messageUrl}`
      );
      return;
    }
    await channel.send(
      `<@${reactor.id}> Successfully marked the user activity as invalid: ${messageUrl}`
    );
  },
});