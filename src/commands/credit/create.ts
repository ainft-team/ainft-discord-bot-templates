import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { AinftFactory } from '../../services/ainftFactory';
import { isAdmin } from '../../utils';

const createCommand = {
  name: 'create',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) =>
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('create app credit')
        .addStringOption((option) =>
          option
            .setName('credit_name')
            .setDescription('credit name')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('credit_symbol') // Move to in execute function looks good as well as command option.
            .setDescription('Please enter a symbol that can simply express credit.')
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

    const name = interaction.options.getString('credit_name');
    const symbol = interaction.options.getString('credit_symbol');
    if (!name || !symbol) {
      return interaction.reply({
        content: 'Credit name and symbol required.',
        ephemeral: true,
      });
    }

    try {
      await ainftFactory.createCredit(name, symbol);
      await interaction.reply({
        content: 'Created!',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true,
      });
    }
  },
};

export default createCommand;
