import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { IDiscordSubCommand } from '../../types';
import { getEventHelpMessage, getLanguageCodeFromLocale, isAdmin } from '../../utils';

const helpCommand: IDiscordSubCommand = {
  name: 'help',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) =>
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('help')
        .setDescription(`See usage for the /event subcommands`)
        .addStringOption((option) =>
          option
            .setName('language')
            .setDescription(`When omitted, it will set to your locale if it's supported, or default to English.`)
            .addChoices(
              {
                name: 'en',
                value: 'en',
              },
              {
                name: 'ko',
                value: 'ko',
              }
            )
        )
    ),
  execute: async (interaction: CommandInteraction) => {
    if (interaction.user.bot || !interaction.guildId) return;
    // NOTE(liayoo): this may need to change once we have non-admin subcommands (e.g. leaderboard)
    if (!isAdmin(interaction.member)) return interaction.reply('Unauthorized');
    const lang = interaction.options.getString('language') ||
      getLanguageCodeFromLocale(interaction.locale);
    return await interaction.reply(getEventHelpMessage(lang));
  },
};

export default helpCommand;
