import { CommandInteraction } from "discord.js";
import { getGeneralHelpMessage, getLanguageCodeFromLocale } from "../../utils";
import Command from "../command";

export const helpCommand = new Command('help', 'See usage for all AINFT Factory commands');

helpCommand.addCommand(async (interaction: CommandInteraction) => {
  if (interaction.user.bot || !interaction.guildId) return;
  const lang = interaction.options.getString('language') ||
    getLanguageCodeFromLocale(interaction.locale);
  return await interaction.reply(getGeneralHelpMessage(lang));
});

helpCommand.addCommandOption(
  'string',
  'language',
  `When omitted, it will set to your locale if it's supported, or default to English.`,
  [
    {
      name: 'en',
      value: 'en',
    },
    {
      name: 'ko',
      value: 'ko',
    },
  ],
  false,
);
