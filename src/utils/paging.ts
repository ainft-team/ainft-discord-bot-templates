import {
  EmbedFieldData,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';

export const selectPagingRowData = (rowData: string[], page: number, limit: number) => {
  const index = (page - 1) * limit;
  const lastIndex = index + limit;
  return rowData.slice(index, lastIndex);
}

export const getPagingMessageActionRow = (
  id: number,
  page: number,
  limit: number,
  total: number,
) => {
  return new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('btn_prev_' + id)
        .setLabel('◀')
        .setStyle('SECONDARY')
        .setDisabled(page === 1)
    )
    .addComponents(
      new MessageButton()
        .setCustomId('btn_next_' + id)
        .setLabel('▶')
        .setStyle('SECONDARY')
        .setDisabled(total <= page * limit)
    );
}

export const getPagingMessageEmbed = (
  rowData: string[],
  page: number,
  lastPage: number,
  title: string,
  description: string,
  emptyDescription: string,
) => {
  const rowFields: EmbedFieldData = {
    name: '\u200B',
    value: rowData.join('\n') || emptyDescription,
  };
  return new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setDescription(description)
    .addFields(rowFields)
    .setTimestamp()
    .setFooter({
      text: `Page ${page}/${lastPage}`,
    });
}

export const getPagingStringData = (list: any[], stringifyFunc: Function, stringifyFuncOptions?: any) => {
  return list.map((value, index) => stringifyFunc(value, { index, ...stringifyFuncOptions }));
}