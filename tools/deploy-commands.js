require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { DISCORD_TOKEN, APPLICATION_ID } = process.env; 

const commandHandlers = require('../dist/commands');
const commands = [
  commandHandlers.eventCommand.getCommand().data.toJSON(),
  commandHandlers.appCommand.getCommand().data.toJSON(),
  commandHandlers.creditCommand.getCommand().data.toJSON(),
  commandHandlers.helpCommand.getCommand().data.toJSON(),
];


const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
rest
  .put(Routes.applicationCommands(APPLICATION_ID), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
