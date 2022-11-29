const SupportedLanguages: {[key: string]: boolean} = {
  'en': true,
  'ko': true,
}

const helpMessages: {[type: string]: {[locale: string]: string}} = {
  app: {
    ko: '```사용법:\n' +
      '<>에 확인하고자 하는 값을 입력하여 데이터를 볼 수 있습니다.\n' +
      '  •  /app connect <appId>\n' +
      '        해당 디스코드 서버를 app과 연결합니다. 연결정보가 있어야 event 등의 정보를 불러올 수 있습니다. 예시) /app connnect my_app\n' +
      '  •  /app help [<language>]\n' +
      '        app에 관한 안내 메세지를 확인하는 기능입니다.```',
    en: '```Usage:\n' +
      'You need to enter the values you want to check in the <> parentheses.\n' +
      '  •  /app connect <appId>\n' +
      '        Connect the Discord server with the app. Information such as events can be called only when connected. e.g. /app connnect my_app\n' +
      '  •  /app help [<language>]\n' +
      '        Display this message.```',
  },
  credit: {
    ko: '```사용법:\n' +
      '<>에 확인하고자 하는 값을 입력하여 데이터를 볼 수 있습니다.\n' +
      '  •  /credit balance <credit_symbol>\n' +
      '        원하는 credit에 대해 확인 가능합니다. 예시) /credit balance <credit_symbol:SD>\n' +
      '  •  /credit give <credit_symbol> <to> <amount> [<reason>]\n' +
      '        credit 을 다른 사람에게 보낼 수 있습니다. 예시) /credit give <credit_symbol:SD> <to:@user> <amount:10> <reason:그냥 좋아서>\n' +
      '  •  /credit help [<language>]\n' +
      '        credit에 관한 안내 메세지를 확인하는 기능입니다.```',
    en: '```Usage:\n' +
      'You need to enter the values you want to check in the <> parentheses.\n' +
      '  •  /credit balance <credit_symbol>\n' +
      '        See your balance of an app credit. e.g. /credit balance <credit_symbol:SD>\n' +
      '  •  /credit give <credit_symbol> <to> <amount> [<reason>]\n' +
      '        Give your credits to someone else. e.g. /credit give <credit_symbol:SD> <to:@user> <amount:10> <reason:I like this person>\n' +
      '  •  /credit help [<language>]\n' +
      '        Display this message.```',
  },
  event: {
    ko: '```사용법:\n' +
      '<>에 확인하고자 하는 값을 입력하여 데이터를 볼 수 있습니다.\n' +
      '[]에 입력한 값을 통해 추가적인 정보를 선택적으로 확인할 수 있습니다.\n' +
      '  •  /event pending-rewards [<user>]\n' +
      '        현재 처리되지 않은 리워드를 확인할 수 있습니다. 어드민이 /event reward 커멘드를 통해 쌓여있는 리워드를 지급할 수 있습니다. 이벤트 채널에서만 사용할 수 있는 커멘드입니다.\n' +
      '  •  /event reward <user> [<amount>]\n' +
      '        유저에게 리워드를 지급하는 어드민 커멘드입니다. 만약 쌓여있는 리워드가 범위내에 존재한다면 특정 값을 <amount>에 지정해주어야합니다. 이벤트 채널에서만 사용할 수 있는 커멘드입니다.\n' +
      '  •  /event history <label> <user> [<index>]\n' +
      '        유저의 활동 기록이나, 보상 기록을 확인할 수 있는 어드민 커멘드입니다. 자세한 정보를 보려면 index를 입력해주어야 합니다. 이벤트 채널에서만 사용할 수 있는 커멘드입니다.\n' +
      '  •  /event help [<language>]\n' +
      '        event에 관한 안내 메세지를 확인하는 기능입니다.```',
    en: '```Usage: \n' +
      'You need to enter the values you want to check in the <> parentheses.\n' +
      'You can see more details with the optional [] parentheses.\n' +
      '  •  /event pending-rewards [<user>]\n' +
      '        Get the pending rewards earned by a user. The /event reward command should be run by an admin to finalize the rewards. This command needs to be run within one of the event channels.\n' +
      '  •  /event reward <user> [<amount>]\n' +
      '        This is an admin command for giving rewards to a user. The amount should be given if the pending rewards are in ranges. This command needs to be run within one of the event channels.\n' +
      '  •  /event history <label> <user> [<index>]\n' +
      '        This is an admin command to check user\'s activity history or reward history. The index should be given if you want to see more detail. This command needs to be run within one of the event channels.\n' +
      '  •  /event help [<language>]\n' +
      '        Display this message.```',
  },
  general: {
    ko: '```사용법:\n' +
      '  •  /app <subcommand>\n' +
      '        App 관련 커멘드들입니다. /app help 커멘드를 통해 더 자세한 내용을 확인할 수 있습니다.\n' +
      '  •  /credit <subcommand>\n' +
      '        App credit 관련 커멘드들입니다. /credit help 커멘드를 통해 더 자세한 내용을 확인할 수 있습니다.\n' +
      '  •  /event <subcommand>\n' +
      '        Tokenomics events 관련 커멘드들입니다. /event help 커멘드를 통해 더 자세한 내용을 확인할 수 있습니다.\n' +
      '  •  /help [<language>]\n' +
      '        AINFT Factory 전체 커멘드를 확인하는 기능입니다.```',
    en: '```Usage: \n' +
      '  •  /app <subcommand>\n' +
      '        Commands regarding app. Use /app help for more info on the subcommands.\n' +
      '  •  /credit <subcommand>\n' +
      '        Commands regarding app credits. Use /credit help for more info on the subcommands.\n' +
      '  •  /event <subcommand>\n' +
      '        Commands regarding the tokenomics events. Use /event help for more info on the subcommands.\n' +
      '  •  /help [<language>]\n' +
      '        Display this message.```',
  },
}

export const getAppHelpMessage = (language: string = 'en') => {
  return helpMessages.app[SupportedLanguages[language] !== true ? 'en' : language];
}

export const getCreditHelpMessage = (language: string = 'en') => {
  return helpMessages.credit[SupportedLanguages[language] !== true ? 'en' : language];
};

export const getEventHelpMessage = (language: string = 'en') => {
  return helpMessages.event[SupportedLanguages[language] !== true ? 'en' : language];
};

export const getGeneralHelpMessage = (language: string = 'en') => {
  return helpMessages.general[SupportedLanguages[language] !== true ? 'en' : language];
};
