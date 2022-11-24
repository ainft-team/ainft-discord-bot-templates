import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { AinftFactory } from '../../services/AinftFactory';

const balanceCommand = {
  name: 'balance',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) =>
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('balance')
        .setDescription('Get your credit balance')
        .addStringOption((option) =>
          option
            .setName('credit_symbol')
            .setDescription('The symbol of the credit you want to see the balance of')
            .setRequired(true)
        )
    ),
  execute: async (interaction: CommandInteraction, ainftFactory?: AinftFactory) => {
    if (interaction.user.bot || !interaction.guildId || !ainftFactory) return;

    const { user } = interaction;
    const symbol = interaction.options.getString('credit_symbol');
    if (!symbol) return await interaction.reply({
      content: 'Please specify a currency symbol',
      ephemeral: true,
    });

    await interaction.deferReply({ ephemeral: true });
    const balance = await ainftFactory?.getCreditBalance(symbol, user.id);
    if (Number.isNaN(balance) || balance.error || balance < 0) {
      return interaction.editReply(`An error occurred. Possibly an invalid credit symbol.`);  
    }
    return interaction.editReply(`Your balance: ${balance} ${symbol}`);
  },
};

export default balanceCommand;
