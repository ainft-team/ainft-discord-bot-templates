import { RewardInstance, TaskInstance } from "@ainft-team/ainft-js";

export interface InstanceParams {
  [key: string]: any;
}

export interface TaskConfigValue extends TaskInstance {
  id: string;
  appId: string;
  eventId: string;
}

export interface TaskConfig {
  [serverId: string]: {
    [channelId: string]: {
      [taskInstanceId: string]: TaskConfigValue
    }
  }
}

export interface RewardConfig {
  [eventId: string]: RewardInstance[]
}

export type AinftJsError = {
  error?: any
};
