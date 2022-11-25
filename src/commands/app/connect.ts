import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { AinftFactory } from '../../services/ainftFactory';
import { isAdmin } from '../../utils';

const connectCommand = {
  name: 'connect',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) =>
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('connect')
        .setDescription('connect discord to app')
        .addStringOption((option) =>
          option
            .setName('app_id')
            .setDescription('Id of the app')
            .setRequired(true)
        )
    ),
  execute: async (interaction: CommandInteraction, ainftFactory?: AinftFactory) => {
    if (interaction.user.bot || !interaction.guildId || !ainftFactory) return;
    
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        content: 'This command only for admin.',
        ephemeral: true,
      });
    }

    await ainftFactory.connectServerToApp(interaction.guildId);

    await interaction.reply({ content: 'Connected', ephemeral: true });
  },
};

export default connectCommand;
