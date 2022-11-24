import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { IDiscordSubCommand } from '../../types';
import { AinftFactory } from '../../services/AinftFactory';
import { isAdmin } from '../../utils';
import { isAinftJsError } from '../../utils/error';

const rewardCommand: IDiscordSubCommand = {
  name: 'reward',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) =>
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('reward')
        .setDescription(`Give rewards to a user`)
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to be rewarded')
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName('amount')
            .setDescription('Optional reward amount')
        )
    ),
  execute: async (interaction: CommandInteraction, ainftFactory?: AinftFactory) => {
    if (interaction.user.bot || !interaction.member || !interaction.guildId || !ainftFactory) return;
    if (!isAdmin(interaction.member)) return interaction.reply('Unauthorized');

    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');
    if (!user) {
      return interaction.reply('Please specify the user option');
    }

    // Reward commands and replies are not ephemeral on purpose.
    await interaction.deferReply();
    const taskConfig = ainftFactory.getTaskConfigAtChannel(
      interaction.guildId,
      interaction.channelId,
    );
    if (!taskConfig) {
      // no event
      return interaction.editReply('Enter this command in one of the event channels');
    }
    const result = await ainftFactory.reward(
      Object.values(taskConfig)[0], // Only 1 task/event associated with a channel
      user.id,
      amount,
    );
    if (!result || isAinftJsError(result)) {
      return interaction.editReply(`Failed to give rewards: ${result.error}`);
    }
    return await interaction.editReply(`Rewarded <@${user.id}> with ${result.amount}`);
  },
};

export default rewardCommand;
