import Command from '../command';
import createCommand from './create';
import rewardCommand from './reward';
import pendingRewardsCommand from './pending-rewards';
import helpCommand from './help';
import historyCommand from './history';

export const eventCommand = new Command('event', 'create and manage your event');

eventCommand.addSubCommands([
  createCommand,
  rewardCommand,
  pendingRewardsCommand,
  helpCommand,
  historyCommand,
]);
