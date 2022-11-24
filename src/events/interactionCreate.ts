import { AinftFactory } from "../services/AinftFactory";
import { IExecuteProps } from "../types";

export const interactionCreate = () => {
  return {
    name: 'interactionCreate',
    execute: async (
      { interaction, client, commands, subcommands, commandNames }: IExecuteProps,
      ainftFactory: AinftFactory,
    ) => {
      if (!interaction.isCommand()) return;

      const commandName = commandNames.find((name) => name === interaction.commandName);
      if (!commandName) return;
      console.log(`${commandName}`);

      const guildId = interaction.guildId;
      const channelId = interaction.channelId;
      if (!guildId || !channelId) return;
      
      const command = commands.get(`${commandName}`);
      let subcommandName = '';
      try {
        subcommandName = interaction.options.getSubcommand();
      } catch (e) {
        // getSubcommand() throws error if a subcommand doesn't exist
      }
      if (subcommandName) {
        // NOTE(liayoo): "Using subcommands or subcommand groups will make your base command unusable"
        //              (ref: https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups)
        console.log(`${commandName}/${subcommandName}`);
        const subcommand = subcommands.get(`${commandName}/${subcommandName}`);
        if (subcommand) {
          try {
            return await subcommand.execute(interaction, ainftFactory);
          } catch (error) {
            console.error(error);
            return await interaction.reply({
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
          }
        }
      } else if (command) {
        try {
          return await command.execute(interaction);
        } catch (error) {
          console.error(error);
          return await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      }
    },
  };
};
