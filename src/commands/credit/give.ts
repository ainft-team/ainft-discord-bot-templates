import { CommandInteraction, User } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { AinftFactory } from '../../services/ainftFactory';
import { isAdmin, isAinftJsError } from '../../utils';

const giveCommand = {
  name: 'give',
  addSubcommand: (slashCommandBuilder: SlashCommandBuilder) =>
    slashCommandBuilder.addSubcommand((subcommand) =>
      subcommand
        .setName('give')
        .setDescription('Transfer your app credits to someone else')
        .addStringOption((option) =>
          option
            .setName('credit_symbol')
            .setDescription('The symbol of the credit you want to transfer')
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName('to')
            .setDescription(`The person you're giving the credits`)
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription(`The amount of credits you're giving`)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription(`Why you're giving your credits to the person`)
        )
    ),
  execute: async (interaction: CommandInteraction, ainftFactory?: AinftFactory) => {
    if (interaction.user.bot || !interaction.guildId || !ainftFactory) return;
    // NOTE(liayoo): this command may become public in the future
    if (!isAdmin(interaction.member)) return interaction.reply('Unauthorized');

    const { user } = interaction;
    const symbol = interaction.options.getString('credit_symbol') as string;
    const to = interaction.options.getUser('to') as User;
    const amount = interaction.options.getInteger('amount') as number;
    const reason = interaction.options.getString('reason');

    if (to.bot) {
      return interaction.reply(`You can't give credits to bots`);
    }
    if (user.id === to.id) {
      return interaction.reply(`You can't give credits to yourself`);
    }
    if (reason && reason.length > 1000) {
      return interaction.reply(`Please give us a shorter reason`);
    }

    await interaction.deferReply();
    const res = await ainftFactory?.transferCredit(
      symbol,
      user.id,
      to.id,
      amount,
      reason,
    );
    if (isAinftJsError(res)) {
      return interaction.editReply(res.error);  
    }
    return interaction.editReply(`Successfully transferred ${amount} ${symbol} to <@${to.id}>`);
  },
};

export default giveCommand;
