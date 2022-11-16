import moment from 'moment';
import { MessageEmbedOptions } from 'discord.js';
import { NFT_SHOW_TITLE, STORE_SHOW_TITLE } from '../common/constants';
import { StoreItem, StoreItemStatus } from '@ainft-team/ainft-js';

const STORE_ITEM_SORTING_ORDER = [StoreItemStatus.AVAILABLE, StoreItemStatus.PREVIEW];

// TODO(liayoo): use the item type from ainft-js
const isStoreItemAvailable = (item: any) => {
  return item.status === 'AVAILABLE' && (!item.saleStartAt || item.saleStartAt < Date.now());
}

const getStoreItemTimeRemaining = (item: any) => {
  return !item.saleEndAt ? Infinity : item.saleEndAt - Date.now();
}

const isStoreItemSaleOpen = (item: any) => {
  return isStoreItemAvailable(item) && getStoreItemTimeRemaining(item) > 0;
}

const getStoreItemSaleOpenMsg = (item: any) => {
  if (item.status === StoreItemStatus.PREVIEW) {
    return 'Preview'
  }
  if (item.status !== StoreItemStatus.AVAILABLE) {
    return 'Not available';
  }

  const saleStartAt = !item.saleStartAt ? -1 : item.saleStartAt;
  const saleEndAt = !item.saleEndAt ? Infinity : item.saleEndAt;
  if (Date.now() < saleStartAt) {
    return moment(saleStartAt).fromNow();
  } else if (saleEndAt < Date.now()) {
    return 'Sale ended';
  }
  return 'Yes';
}

export const stringifyStoreItem = (item: any) => {
  const isSaleOpen = isStoreItemSaleOpen(item);
  let msg =
    `:moneybag: ${item.price} ${item.currency} - ${item.name} ` +
    `[ ${item.quantityRemaining} / ${item.quantityTotal} ]`;
  if (!isSaleOpen) {
    msg += ` (Not Available)`;
  }
  return msg;
}

export const stringifyUserItem = (item: any) => {
  return item ? `${item.name}: ${item.quantityRemaining}` : '';
}

export const stringifyNft = (nft: any) => {
  return nft && nft.metadata ? `${nft.metadata.name}` : '';
}

export const getStoreItemDetailsEmbedData = (item: any) => {
  const isSaleOpen = isStoreItemSaleOpen(item);
  const embed: MessageEmbedOptions = {
    color: '#0x0099FF',
    title: `Store Item Info: ${item.name}`,
    description: item.description,
    fields: [
      {
        name: 'Name',
        value: item.name,
      },
      {
        name: 'Price',
        value: `${item.price} ${item.currency}`,
      },
      {
        name: 'Type',
        value: item.type,
        inline: true,
      },
      {
        name: 'Subtype',
        value: item.subtype,
        inline: true,
      },
      {
        name: 'Stock remaining',
        value: `${item.quantityRemaining}`,
        inline: true,
      },
      {
        name: 'Sale open',
        value: getStoreItemSaleOpenMsg(item),
        inline: true,
      },
    ],
  }
  if (isSaleOpen) {
    embed.fields?.push({
      name: 'Time remaining',
      value: `${item.saleEndAt ? moment(item.saleEndAt).fromNow(true) : 'Infinity'}`,
      inline: true,
    });
  }
  if (item.image) embed.image = { url: item.image };
  return embed;
}

export const getUserItemDetailsEmbedData = (item: any) => {
  const embed: MessageEmbedOptions = {
    color: '#0x0099FF',
    title: `Inventory Item Info: ${item.name}`,
    description: item.description,
    fields: [
      {
        name: 'Name',
        value: item.name,
      },
      {
        name: 'Type',
        value: item.type,
        inline: true,
      },
      {
        name: 'Subtype',
        value: item.subtype,
        inline: true,
      },
      {
        name: 'Stock remaining',
        value: `${item.quantityRemaining}`,
        inline: true,
      },
    ]
  }
  if (item.image) embed.image = { url: item.image };
  return embed;
}

export const getItemUsedEmbedData = (image: string, isTryOn = true) => {
  const embed: MessageEmbedOptions = {
    color: '#0x0099FF',
    title: isTryOn ? 'Item Preview' : 'Item Applied',
    image: { url: image },
  }
  return embed;
}

export const getNftDetailsEmbedData = (nft: any) => {
  const embed: MessageEmbedOptions = {
    color: '#0x0099FF',
    title: `NFT Info: ${nft.metadata.name}`,
    fields: [
      {
        name: 'Name',
        value: nft.metadata.name,
        inline: true,
      },
      {
        name: 'Token ID',
        value: nft.tokenId,
        inline: true,
      },
      {
        name: 'Owner',
        value: nft.owner,
      },
      {
        name: 'Contract Address',
        value: nft.contractAddress,
      },
    ]
  }
  if (nft.metadata?.image) embed.image = { url: nft.metadata?.image };
  return embed;
}

export const getStoreTitle = (storeId: string) => {
  return `${STORE_SHOW_TITLE}: ${storeId}`;
}

export const getNftListTitle = (symbol: string) => {
  return `${NFT_SHOW_TITLE}: ${symbol}`;
}

export const sortStoreItemsByStatus = (items: Array<StoreItem>) => {
  return items.sort((a, b) => STORE_ITEM_SORTING_ORDER.indexOf(a.status) - STORE_ITEM_SORTING_ORDER.indexOf(b.status));
}