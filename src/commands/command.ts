import { SlashCommandBuilder } from '@discordjs/builders';
import { IDiscordSubCommand, IDiscordCommand, IExecuteFunc } from '../types';

export default class Command {
  public name: string;
  public description: string;
  private commandBuilder: SlashCommandBuilder;
  private subcommands: Array<IDiscordSubCommand>;
  private execute: IExecuteFunc;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;

    this.commandBuilder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
    this.subcommands = [];

    this.execute = async () => {};
  }

  addCommand(executeFunc: IExecuteFunc) {
    this.execute = executeFunc;
  }

  addCommandOption(
    type: string,
    name: string,
    description: string,
    choices: {name: string, value: string}[],
    isRequired: boolean = false,
  ) {
    switch (type) {
      case 'string':
        this.commandBuilder.addStringOption((_option) => {
          const option = _option
            .setName(name)
            .setDescription(description)
            .setRequired(isRequired);
          if (choices.length > 0) {
            option.addChoices(...choices);
          }
          return option;
        });
        break;
      // add other options below
    }
  }

  addSubCommands(subcommands: Array<IDiscordSubCommand>) {
    for (const subcommand of subcommands) {
      subcommand.addSubcommand(this.commandBuilder);
      this.subcommands.push(subcommand);
    }
  }

  getCommand(): IDiscordCommand {
    return {
      data: this.commandBuilder,
      execute: this.execute
    };
  }

  getSubCommands() {
    return this.subcommands;
  }
}
