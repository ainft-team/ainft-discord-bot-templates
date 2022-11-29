import Command from '../command';
import connectCommand from "./connect";
import helpCommand from './help';

export const appCommand = new Command('app', 'connect discord to app');
appCommand.addSubCommands([connectCommand, helpCommand]);
