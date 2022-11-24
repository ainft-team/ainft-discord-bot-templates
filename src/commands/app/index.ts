import Command from '../command';
import connectCommand from "./connect";

export const appCommand = new Command('app', 'connect discord to app');
appCommand.addSubCommands([ connectCommand ]);
