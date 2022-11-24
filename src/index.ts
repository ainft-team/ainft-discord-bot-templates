import 'dotenv/config';
import {
  Client,
  Collection,
  CommandInteraction,
  Intents,
  Message,
  MessageReaction,
  PartialMessageReaction,
  User,
} from 'discord.js';

import * as commandHandlers from './commands';
import * as eventHandlers from './events';
import { IDiscordCommand, IDiscordSubCommand } from './types';
import { AinftFactory } from './services/AinftFactory';

const { DISCORD_TOKEN } = process.env;

const commandNames: Array<string> = [];
const discordCommands = new Collection<string, IDiscordCommand>();
const discordSubCommands = new Collection<string, IDiscordSubCommand>();

function initializeBot() {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
    partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
  });
  const ainftFactory = new AinftFactory();

  for (const command of Object.values(commandHandlers)) {
    const _command = command.getCommand();
    if (_command) {
      discordCommands.set(`${command.name}`, _command);
    }
    const subCommands = command.getSubCommands();
    for (const subCommand of subCommands) {
      discordSubCommands.set(`${command.name}/${subCommand.name}`, subCommand);
    }
    commandNames.push(command.name);
  }

  const readyEventHandler = eventHandlers.ready();
  const interactionCreateEventHandler = eventHandlers.interactionCreate();
  const messageCreateEventHandler = eventHandlers.messageCreate();
  const messageReactionAddEventHandler = eventHandlers.messageReactionAdd();
  client.once(readyEventHandler.name, async () => {
    await readyEventHandler.execute(client, ainftFactory);
  });
  client.on(
    interactionCreateEventHandler.name,
    (interaction: CommandInteraction) =>
      interactionCreateEventHandler.execute({
        interaction,
        client,
        commands: discordCommands,
        subcommands: discordSubCommands,
        commandNames
      }, ainftFactory)
  );
  client.on(
    messageCreateEventHandler.name,
    (message: Message) => messageCreateEventHandler.execute(message, ainftFactory),
  );
  client.on(
    messageReactionAddEventHandler.name,
    (reaction: MessageReaction | PartialMessageReaction, user: User) =>
      messageReactionAddEventHandler.execute(reaction, user, ainftFactory),
  );

  client.login(DISCORD_TOKEN);
}

initializeBot();