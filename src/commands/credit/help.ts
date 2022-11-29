import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { IDiscordSubCommand } from '../../types';
import { getCreditHelpMessage, getLanguageCodeFromLocale } from '../../utils';

const helpCommand: IDiscordSubCommand = {
  name: 'help',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) =>
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('help')
        .setDescription(`See usage for the /credit subcommands`)
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
    const lang = interaction.options.getString('language') ||
      getLanguageCodeFromLocale(interaction.locale);
    return await interaction.reply(getCreditHelpMessage(lang));
  },
};

export default helpCommand;
