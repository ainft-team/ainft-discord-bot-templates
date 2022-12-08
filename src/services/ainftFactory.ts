import AinftJs, { Platforms, RewardInstance, TaskInstance, TaskTypeCategory } from '@ainft-team/ainft-js';
import { TaskConfig, TaskConfigValue } from '../types';
import {
  NOT_CONNECTED_WITH_APP,
  NO_EVENT_TASK_CONFIG_AT_CHANNEL,
} from '../common/constants';

export class AinftFactory {
  private ainftJs: AinftJs;
  private taskConfig: TaskConfig = {};
  readonly appId = process.env.AINFT_SERVER_APP_ID!;

  constructor() {
    this.ainftJs = new AinftJs(
      process.env.AINFT_SERVER_ACCESS_KEY as string,
      process.env.AINFT_SERVER_ENDPOINT as string,
      process.env.AIN_BLOCKCHAIN_ENDPOINT as string,
      Number(process.env.AIN_BLOCKCHAIN_CHAIN_ID as string) as 0 | 1,
    );
  }

  async connectServerToApp(serverId: string) {
    return this.ainftJs.discord.connectDiscordWithApp(this.appId, serverId);
  }

  async isConnected(serverId: string) {
    return this.ainftJs.discord
      .getConnectedApp(serverId, this.appId)
      .catch((error) => {
        console.error(error);
        return null;
      });
  }

  async getEventsByServer(appId: string, serverId: string) {
    return this.ainftJs.discord
      .getConnectedEventsByServer(appId, serverId)
      .catch((error) => {
        console.error(error);
        return null;
      });
  }

  getTaskConfigAtChannel(serverId: string, channelId: string) {
    const config =
      this.taskConfig[serverId] && this.taskConfig[serverId][channelId];
    return config ? config : null;
  }

  setTaskConfig(_taskConfig: TaskConfig) {
    this.taskConfig = _taskConfig;
  }

  async loadTaskConfig(serverId: string) {
    const events = await this.getEventsByServer(this.appId, serverId);
    if (!events) return;
    const newTaskConfig: TaskConfig = {};
    events.forEach((event) => {
      if (!event) return;
      const appId = event.appId;
      const eventId = event.id;
      if (!event.taskInstances) return;
      Object.entries(event.taskInstances).map(([taskInstanceId, task]) => {
        if (!task.params) return;
        if (!AinftFactory.isTwitterRelatedTaskCategory(task.category)) return;
        const { discordChannelId, discordServerId } = task.params;
        if (!discordChannelId || !discordServerId) return;
        if (!newTaskConfig[discordServerId]) {
          newTaskConfig[discordServerId] = {};
        }
        if (!newTaskConfig[discordServerId][discordChannelId]) {
          newTaskConfig[discordServerId][discordChannelId] = {};
        }
        newTaskConfig[discordServerId][discordChannelId][taskInstanceId] = {
          ...task,
          id: taskInstanceId,
          appId,
          eventId,
        };
      });
    });

    this.setTaskConfig({ ...this.taskConfig, ...newTaskConfig });
  }

  async createEvent(
    eventId: string,
    userId: string,
    description: string,
    taskInstanceList: Array<TaskInstance>,
    rewardInstanceList: Array<RewardInstance>,
    startAt: number,
    endAt: number
  ) {
    return this.ainftJs.event.create({
      appId: this.appId,
      userId,
      eventId,
      description,
      taskInstanceList,
      rewardInstanceList,
      startAt,
      endAt,
      platform: Platforms.DISCORD,
    }).catch((error) => {
      console.error(error);
      return { error: error.message || error }
    });
  }

  async addEventActivity(
    taskConfig: TaskConfigValue,
    userId: string,
    messageId: string,
    content: any,
  ) {
    const { appId, eventId, id: taskInstanceId, category } = taskConfig;
    const data: { [key: string]: any } = {
      discordMessageId: messageId,
      discordMessageText: content,
    };
    try {
      if (AinftFactory.isTwitterRelatedTaskCategory(category)) {
        data['twitterUrl'] = AinftFactory.extractTwitterUrlFromMessage(content);
        if (!data['twitterUrl']) {
          return {
            error: 'Missing a twitter url',
          };
        }
      }
      const activityId = await this.ainftJs.event.addActivity({
        appId,
        userId,
        eventId,
        taskInstanceId,
        data,
      });
      console.log(`Created event activity ${activityId}`);
      return true;
    } catch (e: any) {
      console.log(`Failed to add event activity:`, data, e);
      return {
        error: `${e.message ? e.message : e}`,
      };
    }
  }

  async getActivity(
    serverId: string,
    channelId: string,
    userId: string,
    createdAt: number,
    discordMessageId: string,
  ) {
    const taskConfig = this.getTaskConfigAtChannel(serverId, channelId);
    if (!taskConfig) return { error: NO_EVENT_TASK_CONFIG_AT_CHANNEL };
    const task = Object.values(taskConfig)[0];
    try {
      return await this.ainftJs.event.getActivity({
        appId: task.appId,
        userId,
        eventId: task.eventId,
        createdAt,
        options: { discordMessageId },
      });
    } catch (error: any) {
      console.error(`Failed to get activity - ${error}`);
      console.log({
        serverId,
        channelId,
        userId,
        createdAt,
        discordMessageId,
        ...task,
      });
      return { error: error.message || error };
    }
  }

  async updateActivityStatus(
    serverId: string,
    eventId: string,
    activityId: string,
    createdAt: number,
    status: string,
  ) {
    try {
      return await this.ainftJs.event.updateActivityStatus({
        appId: this.appId,
        eventId,
        activityId,
        createdAt,
        status,
      });
    } catch (error: any) {
      console.error(`Failed to update activity status - ${JSON.stringify(error)}`);
      console.log({
        serverId,
        eventId,
        activityId,
        createdAt,
        status,
      });
      return { error: error.message || error };
    }
  }

  async getPendingRewards(
    taskConfig: TaskConfigValue,
    userId: string,
  ) {
    let minAmount = 0, maxAmount = 0;
    try {
      const { appId, eventId, category } = taskConfig;
      if (!AinftFactory.isTwitterRelatedTaskCategory(category)) {
        return { error: `Unsupported task` };
      }
      const pendingRewards = await this.ainftJs.event.getPendingRewards(
        appId,
        userId,
        eventId,
      );
      return pendingRewards ? pendingRewards.totalAmount : { minAmount, maxAmount };
    } catch (e: any) {
      console.log(`Failed to get pending rewards: `, e);
      return { error: `${e.message ? e.message : e}` };
    }
  }

  async reward(
    taskConfig: TaskConfigValue,
    userId: string,
    amount: number | null,
  ) {
    const { appId, eventId } = taskConfig;
    if (!appId) {
      return { error: 'No app associated with the server.' };
    }
    try {
      return await this.ainftJs.event.reward(
        appId,
        userId,
        eventId,
        (amount !== null) ? { amount } : undefined,
      );
    } catch (e: any) {
      return { error: `${e.message ? e.message : e}` };
    }
  }

  async createCredit(name: string, symbol: string) {
    return this.ainftJs.asset.createAppCredit(this.appId, symbol, name);
  }

  async getCreditBalance(symbol: string, userId: string) {
    return this.ainftJs.asset.getUserCreditBalance(this.appId, symbol, userId)
      .then((res: any) => res.balance)
      .catch((e) => {
        return { error: `${e.message ? e.message : e}` };
      });
  }

  async transferCredit(
    symbol: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    reason: string | null,
  ) {

    return this.ainftJs.asset.transferAppCredit(
      this.appId,
      symbol,
      fromUserId,
      toUserId,
      amount,
      reason ? { reason } : undefined,
    )
    .then((_) => true)
    .catch((e) => {
      return { error: `${e.message ? e.message : e}` };
    });
  }

  static isTwitterRelatedTaskCategory(category: string) {
    return (
      category === TaskTypeCategory.TWITTER_MINING ||
      category === TaskTypeCategory.NFT_GAME
    );
  }

  static extractTwitterUrlFromMessage(message: string) {
    // try matching the tweet pattern
    let match = RegExp(/https:\/\/twitter\.com\/(\w+)\/status\/(\d+)/).exec(message);
    if (match) return match[0];
    // try matching the profile pattern
    match = RegExp(/https:\/\/twitter\.com\/(\w+)/).exec(message);
    if (match) return match[0];
    return null;
  }

  async getActivityHistory(taskConfig: TaskConfigValue, userId: string) {
    const { appId, eventId } = taskConfig;
    if (!appId) {
      return { error: NOT_CONNECTED_WITH_APP }
    }
    return this.ainftJs.event
      .getActivityHistory(appId, userId, eventId)
      .catch((e: any) => ({ error: `${e.message || e}` }));
  }

  async getRewardHistory(taskConfig: TaskConfigValue, userId: string) {
    const { appId, eventId } = taskConfig;
    if (!appId) {
      return { error: NOT_CONNECTED_WITH_APP };
    }
    return this.ainftJs.event
      .getRewardHistory(appId, userId, eventId)
      .catch((e: any) => ({ error: `${e.message || e}` }));
  }
}
