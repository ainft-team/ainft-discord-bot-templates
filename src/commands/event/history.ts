import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { IDiscordSubCommand } from '../../types';
import { AinftFactory } from '../../services/ainftFactory';
import {
  getPagingMessageActionRow,
  getPagingMessageEmbed,
  getPagingStringData,
  isAdmin,
  isAinftJsError,
  selectPagingRowData,
} from '../../utils';
import {
  HISTORY_SHOW_DESCRIPTION,
  HISTORY_SHOW_EMPTY_DESCRIPTION,
  PAGING_LIMIT,
  PAGING_START,
} from '../../common/constants';
import {
  getActivityHistoryDetailsEmbedData,
  getHistoryTitle,
  getRewardHistoryDetailsEmbedData,
  stringifyActivityHistory,
  stringifyRewardHistory,
} from '../../utils/event';

const historyCommand: IDiscordSubCommand = {
  name: 'history',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) => {
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('history')
        .setDescription(`Show user's activity or reward history in this event channel.`)
        .addStringOption((option) =>
          option
            .setName('label')
            .setDescription('Label you want to see.')
            .addChoices(
              { name: 'activity', value: 'activity' },
              { name: 'reward', value: 'reward' }
            )
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User you want to see history')
            .setRequired(true)
        )
        .addIntegerOption((option) => 
          option.setName('index').setDescription('Index of history entry')
        )
    );
  },
  execute: async (
    interaction: CommandInteraction,
    ainftFactory?: AinftFactory
  ) => {
    if (interaction.user.bot || !interaction.member || !interaction.guildId || !interaction.channel || !ainftFactory) return;
    if (!isAdmin(interaction.member)) return interaction.reply('Unauthorized');

    await interaction.deferReply({ ephemeral: true });
    const customId = Date.now();
    const label = interaction.options.getString('label');
    const user = interaction.options.getUser('user');
    const index = interaction.options.getInteger('index');
    if (!user) {
      return interaction.editReply('Please specify the user option');
    }
    if (index !== null && index < 1) {
      return interaction.editReply('Please enter a positive number for the index');
    }

    const taskConfig = ainftFactory.getTaskConfigAtChannel(
      interaction.guildId,
      interaction.channelId
    );
    if (!taskConfig) {
      // no event
      return interaction.editReply('Enter this command in one of the event channels');
    }
    const task = Object.values(taskConfig)[0];

    let history: any = [];
    let stringify: any;
    let getDetailEmbedData: any;
    switch (label) {
      case 'activity':
        history = await ainftFactory.getActivityHistory(task, user.id);
        stringify = stringifyActivityHistory;
        getDetailEmbedData = getActivityHistoryDetailsEmbedData;
        break;
      case 'reward':
        history = await ainftFactory.getRewardHistory(task, user.id);
        stringify = stringifyRewardHistory;
        getDetailEmbedData = getRewardHistoryDetailsEmbedData;
        break;
      default:
        return interaction.reply('Please select valid label.');
    }

    if (isAinftJsError(history)) {
      return await interaction.editReply(history.error);
    }

    if (index) {
      if (index > history.length) {
        return await interaction.editReply('Please enter an index matches the range.');
      } 
      const historyItem = history[index-1];
      return await interaction.editReply({
        embeds: [getDetailEmbedData(historyItem, index, interaction.guildId, interaction.channelId)],
      });
    }

    let page = PAGING_START;
    const lastPage = Math.ceil((history.length || 1) / PAGING_LIMIT);
    const data = getPagingStringData(history, stringify, { locale: interaction.locale });
    let rowData = selectPagingRowData(data, page, PAGING_LIMIT);
    const title = getHistoryTitle(user.username, label, task.eventId);
    const messageEmbed = getPagingMessageEmbed(
      rowData,
      page,
      lastPage,
      title,
      HISTORY_SHOW_DESCRIPTION,
      HISTORY_SHOW_EMPTY_DESCRIPTION,
    );
    const row = getPagingMessageActionRow(customId, page, PAGING_LIMIT, history.length);

    await interaction.editReply({
      embeds: [messageEmbed],
      components: [row],
    });

    const filter = (
      buttonInteraction: MessageComponentInteraction<'cached'>
    ) => {
      return interaction.user.id === buttonInteraction.user.id;
    };

    const collector = interaction.channel?.createMessageComponentCollector({
      filter,
    });
    if (!collector) return;
    return await collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.customId === `btn_prev_${customId}`) {
        page--;
      } else if (buttonInteraction.customId === `btn_next_${customId}`) {
        page++;
      } else {
        return;
      }
      const updatedRow = getPagingMessageActionRow(
        customId,
        page,
        PAGING_LIMIT,
        history.length
      );
      let rowData = selectPagingRowData(data, page, PAGING_LIMIT);
      const messageEmbed = getPagingMessageEmbed(
        rowData,
        page,
        lastPage,
        title,
        HISTORY_SHOW_DESCRIPTION,
        HISTORY_SHOW_EMPTY_DESCRIPTION
      );
      return await buttonInteraction.update({
        embeds: [messageEmbed],
        components: [updatedRow],
      });
    });
  },
};

export default historyCommand;
