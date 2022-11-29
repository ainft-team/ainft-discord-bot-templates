import { GuildMember, PermissionResolvable, Permissions } from "discord.js";
import { APIInteractionDataResolvedGuildMember } from "discord-api-types/v10";

const checkPermission = (
  member: GuildMember | APIInteractionDataResolvedGuildMember | null,
  permission: PermissionResolvable
) => {
  return (member?.permissions as Readonly<Permissions>).has(permission);
}

export const isAdmin = (member: GuildMember | APIInteractionDataResolvedGuildMember | null) => {
  return checkPermission(member, Permissions.FLAGS.ADMINISTRATOR);
}
