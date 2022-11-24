import { Activity, RewardInfo } from "@ainft-team/ainft-js";
import { MessageEmbedOptions } from "discord.js";
import { getLanguageCodeFromLocale } from "./locale";

export const stringifyActivityHistory = (activity: Activity, options?: any) => {
  if (!activity.createdAt) return '';
  const locale = getLanguageCodeFromLocale(options?.locale || 'en-US');
  const index = options?.index !== undefined ? options.index + 1 : null;
  const dateString = getLocaleDateTimeString(activity.createdAt, locale);
  const msg = `activity - ${dateString} **(${activity.status})**`;
  return index ? `${index}. ${msg}` : msg;
};

export const stringifyRewardHistory = (reward: RewardInfo, options?: any) => {
  const locale = getLanguageCodeFromLocale(options?.locale || 'en-US');
  const index = options?.index !== undefined ? options.index + 1 : null;
  const dateString = getLocaleDateTimeString(reward.createdAt, locale);
  const msg = `reward - ${dateString} (amount: ${reward.amount})`;
  return index ? `${index}. ${msg}` : msg;
};

export const getHistoryTitle = (username: string, label: string, eventId: string) => {
  return `${username}'s ${eventId} ${label} history`;
}

const getLocaleDateTimeString = (date: number, locale = 'en') => new Intl.DateTimeFormat(locale, { timeStyle: 'long', dateStyle: 'medium' }).format(new Date(date));
const getLocaleDateString = (date: number, locale = 'en') => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));

export const getActivityHistoryDetailsEmbedData = (activity: Activity, index: number, serverId: string, channelId: string) => {
  const createdAt = getLocaleDateTimeString(activity.createdAt);
  const updatedAt = getLocaleDateTimeString(activity.updatedAt);
  const embed: MessageEmbedOptions = {
    color: '#0x0099FF',
    title: `Activity History Detail`,
    description: `<@${activity.userId}>'s activity history [${index}] at ${createdAt}`,
    fields: [
      {
        name: 'Event',
        value: activity.eventId || 'NO_EVENT',
        inline: true,
      },
      {
        name: 'Status',
        value: activity.status,
        inline: true,
      },
      {
        name: 'Data',
        value: stringifyActivityData(activity.data),
      },
      {
        name: 'CreatedAt',
        value: createdAt,
        inline: true,
      },
      {
        name: 'UpdatedAt',
        value: updatedAt,
        inline: true,
      },
    ],
  };

  if (activity.data?.discordMessageId) {
    const messageLink = getDiscordMessageLink(serverId, channelId, activity.data.discordMessageId);
    embed.fields?.push({
      name: 'Activity Message Link',
      value: messageLink,
    });
  }
  return embed;
};

export const getRewardHistoryDetailsEmbedData = (rewardInfo: RewardInfo, index: number, guildId: string, channelId: string) => {
  const createdAt = getLocaleDateTimeString(rewardInfo.createdAt);
  const embed: MessageEmbedOptions = {
    color: '#0x0099FF',
    title: `Reward History Detail`,
    description: `<@${rewardInfo.userId}>'s reward history [${index}] at ${createdAt}`,
    fields: [
      {
        name: 'Event',
        value: rewardInfo.eventId || 'NO_EVENT',
      },
      {
        name: 'Amount',
        value: String(rewardInfo.amount),
        inline: true,
      },
      {
        name: 'CreatedAt',
        value: createdAt,
        inline: true,
      },
    ],
  };

  if (rewardInfo.boostInfo?.nfts) {
    const contractAddressAndTokenIds = getContractAddrAndTokenFromBoostNft(rewardInfo.boostInfo.nfts);
    const msg = Object.entries(contractAddressAndTokenIds).reduce((prev, [address, tokenIds]) => {
      return prev + `${address} - ${tokenIds.join(', ')} \n`;
    }, '')
    embed.fields?.push({
      name: 'Boost NFTs',
      value: msg,
    });
  }

  // NOTE(hyeonwoong): rewardedDates will be deleted..
  const details = rewardInfo.rewardedDates || rewardInfo.details;
  if (details !== undefined) {
    let msg = '';
    const messageLinks: Array<string> = [];
    Object.entries(details).map(([timestamp, detail]) => {
      const date = getLocaleDateString(Number(timestamp), 'en');
      msg += `**${date}** 
        minAmount - ${detail.minAmount} 
        maxAmount - ${detail.maxAmount} 
        ${detail.activities ? `numOfActivities - ${detail.activities.length || 0}` : ''} \n`;
      
      if (detail.activities) {
        detail.activities.map((activity: Activity) => {
          if (activity.data.discordMessageId) {
            messageLinks.push(getDiscordMessageLink(guildId, channelId, activity.data.discordMessageId))
          }
        })
      }
    });

    embed.fields?.push({
      name: 'Details',
      value: msg,
    });

    if (messageLinks.length > 0) {
      embed.fields?.push({
        name: 'Activity Message Links',
        value: messageLinks.join('\n'),
      })
    }
  }
  return embed;
};

const getContractAddrAndTokenFromBoostNft = (nfts: {
  [contractAddress: string]: {
    [ethAddress: string]: { [tokenId: string]: any };
  };
}) => {
  const contractAddressAndTokenIds: { [address: string]: Array<string | number> } = {};
  Object.entries(nfts).forEach(([contractAddress ,collection]) => {
    Object.values(collection).forEach((_nfts) => {
      if (!contractAddressAndTokenIds[contractAddress]) {
        contractAddressAndTokenIds[contractAddress] = Object.keys(_nfts);
      } else {
        contractAddressAndTokenIds[contractAddress].push(...Object.keys(_nfts));
      }
    })
  });

  return contractAddressAndTokenIds;
};

const getDiscordMessageLink = (
  guildId: string,
  channelId: string,
  messageId: string
) => `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

const stringifyActivityData = (data: object) => {
  let msg = '';
  Object.entries(data).forEach(([key, value]) => {
    msg += `*${key}*: ${value} \n`;
  });
  return msg;
}