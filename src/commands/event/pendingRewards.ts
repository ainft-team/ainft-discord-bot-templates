import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { IDiscordSubCommand } from '../../types';
import { AinftFactory } from '../../services/ainftFactory';
import { isAinftJsError } from '../../utils/error';

const rewardCommand: IDiscordSubCommand = {
  name: 'pending-rewards',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) =>
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('pending-rewards')
        .setDescription(`Get the amount of pending rewards for a user`)
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to be rewarded')
        )
    ),
  execute: async (interaction: CommandInteraction, ainftFactory?: AinftFactory) => {
    if (interaction.user.bot || !interaction.guildId || !ainftFactory) return;
    const user = interaction.options.getUser('user') || interaction.user;
    if (!user) return;

    await interaction.deferReply({ ephemeral: true });
    const taskConfig = ainftFactory.getTaskConfigAtChannel(
      interaction.guildId,
      interaction.channelId,
    );
    if (!taskConfig) {
      return interaction.editReply('Enter this command in one of the event channels');
    }
    const task = Object.values(taskConfig)[0];
    const pendingRewards = await ainftFactory.getPendingRewards(task, user.id);
    if (!pendingRewards || isAinftJsError(pendingRewards)) {
      // error
      return interaction.editReply('Failed to get the pending rewards');
    }
    if (pendingRewards.minAmount === 0 && pendingRewards.maxAmount === 0) {
      // no pending rewards
      return interaction.editReply('User does not have any pending rewards');
    }
    if (pendingRewards.minAmount === pendingRewards.maxAmount) {
      // exact amount can be given
      return interaction.editReply(`Pending rewards: ${pendingRewards.minAmount}`);
    }
    // user can be given somewhere between minAmount and maxAmount
    return interaction.editReply(`Pending rewards: ${pendingRewards.minAmount} ~ ${pendingRewards.maxAmount}`);
  },
};

export default rewardCommand;
