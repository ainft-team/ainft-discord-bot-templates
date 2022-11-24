import { Client, Collection, CommandInteraction } from 'discord.js';

import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { AinftFactory } from '../services/AinftFactory';

export type IExecuteFunc =
  (interaction: CommandInteraction, ainftFactory?: AinftFactory) => Promise<any>;

export interface IExecuteProps {
  interaction: CommandInteraction;
  client: Client;
  commands: Collection<string, IDiscordCommand>;
  subcommands: Collection<string, IDiscordSubCommand>;
  commandNames: Array<string>;
}

export interface IDiscordCommand {
  data:
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: IExecuteFunc;
}

export interface IDiscordSubCommand {
  name: string;
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) => void;
  execute: IExecuteFunc;
}
