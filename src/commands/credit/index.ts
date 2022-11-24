import Command from '../command';
import createCommand from './create';
import balanceCommand from './balance';
import giveCommand from './give';
import helpCommand from './help';

export const creditCommand = new Command('credit', 'Manage app credit');
creditCommand.addSubCommands([
  createCommand,
  balanceCommand,
  giveCommand,
  helpCommand,
]);
