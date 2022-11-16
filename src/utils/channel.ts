import { WHITELISTED_CHANNELS } from "../common/constants"

export const isWhitelistedChannel = (guildId: string, channelId: string) => {
  const env = process.env.NODE_ENV as 'dev' | 'prod';
  return WHITELISTED_CHANNELS[env] &&
    WHITELISTED_CHANNELS[env][guildId] &&
    WHITELISTED_CHANNELS[env][guildId][channelId] === true;
}