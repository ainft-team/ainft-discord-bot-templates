import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { IDiscordSubCommand } from "../../types";
import { AinftFactory } from "../../services/AinftFactory";
import { isAdmin, isAinftJsError } from "../../utils";
import { RewardDistributeType, RewardTypeCategory, TaskTypeCategory } from "@ainft-team/ainft-js";


const createCommand: IDiscordSubCommand = {
  name: 'create',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) => {
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription(`create event`)
        .addStringOption((option) =>
          option
            .setName('event_id')
            .setDescription('Id of the event')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('task')
            .setDescription(`Choice event's task type`)
            .addChoices({
              name: 'Twitter Mining',
              value: TaskTypeCategory.TWITTER_MINING,
            })
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('credit')
            .setDescription('Credit symbol to be used as event rewards')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('Amount of credits to be given as event rewards')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('keywords')
            .setDescription(
              'Keywords that should be in a tweet. If registering multiple, separate them with `,`.'
            )
        )
        .addStringOption((option) =>
          option
            .setName('mentions')
            .setDescription(
              'Mentions that should be in a tweet. If registering multiple, separate them with `,`.'
            )
        )
    );},
  execute: async (interaction: CommandInteraction, ainftFactory?: AinftFactory) => {
    if (
      interaction.user.bot ||
      !interaction.member ||
      !interaction.guildId ||
      !interaction.channel ||
      !ainftFactory
    )
      return;
    if (!isAdmin(interaction.member)) return interaction.reply({
      content: 'This command only for admin.',
      ephemeral: true,
    });

    const eventId = interaction.options.getString('event_id');
    const task = interaction.options.getString('task');
    const credit = interaction.options.getString('credit');
    const amount = interaction.options.getInteger('amount');
    const keywords = interaction.options.getString('keywords');
    const mentions = interaction.options.getString('mentions');

    if (!eventId || !task || !credit || !amount) {
      return interaction.reply({
        content:
          'eventId, eventType, credit, and amount are required input elements.',
        ephemeral: true,
      });
    }

    if (task !== TaskTypeCategory.TWITTER_MINING) {
      return interaction.reply({
        content: 'This event type is not supported.',
        ephemeral: true,
      });
    }

    const taskConfig = await ainftFactory.getTaskConfigAtChannel(interaction.guildId, interaction.channelId);
    if (taskConfig) {
      return interaction.reply({
        content: 'There are already events assigned to this channel.',
        ephemeral: true,
      });
    }

    const existingCredit = await ainftFactory.getCreditBalance(credit, interaction.user.id);
    if (isAinftJsError(existingCredit)) {
      return interaction.reply({
        content: 'No credit found. Please enter a valid credit symbol.',
        ephemeral: true,
      });
    }

    const taskInstance: any = {
      category: TaskTypeCategory.TWITTER_MINING,
      params: {
        discordServerId: interaction.guildId,
        discordChannelId: interaction.channelId,
      }
    };

    let taskTypeId = 'twitter-mining-no-eventpost';
    if (keywords) {
      const keywordList = keywords.split(',');
      taskInstance.params.keywords = keywordList;
    } else {
      taskTypeId += '-keywords';
    }

    if (mentions) {
      const mentionList = mentions.split(',');
      taskInstance.params.mentions = {
        numMentions: mentionList.length,
        usernames: mentionList
      }
    } else {
      taskTypeId += '-mentions';
    }

    taskInstance.taskTypeId = taskTypeId;

    const rewardInstance = {
      rewardTypeId: 'APP_CREDIT',
      category: RewardTypeCategory.APP_CREDIT,
      amount,
      distributeAt: RewardDistributeType.MANUAL,
      params: {
        name: '',
        description: '',
        symbol: credit,
      }
    }

    const now = Date.now();
    const res = await ainftFactory.createEvent(
      eventId,
      interaction.user.id,
      `twitter mining event`,
      [taskInstance],
      [rewardInstance],
      now,
      now + 1000 * 60 * 24 * 365 // add 1 year
    );
    if (isAinftJsError(res)) {
      return interaction.reply({
        content: `Event creation failed. \nDetail: ${res.error}`,
        ephemeral: true,
      })
    }

    await interaction.reply({
      content: 'Event created!',
      ephemeral: true
    });

    await ainftFactory.loadTaskConfig(interaction.guildId);
  },
};

export default createCommand;
