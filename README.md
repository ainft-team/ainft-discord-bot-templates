# AINFT-Factory discord bot template  
This is an ainft factory discord bot template that supports simple features related to tokenomics.

## Requirements
- node >= 16.6
- ainft server app  
  - If you do not have the nft server app, go to [tools/create_ainft_server_app](https://github.com/ainft-team/ainft-discord-bot-templates/tools/create_ainft_server_app).

## Environments
- DISCORD_TOKEN
- APPLICATION_ID  
// For ainft-js
- AINFT_SERVER_APP_ID
- AINFT_SERVER_ACCESS_KEY
- AINFT_SERVER_ENDPOINT
  - dev: https://ainft-api-dev.ainetwork.ai
  - prod: https://ainft-api.ainetwork.ai
- AIN_BLOCKCHAIN_ENDPOINT
  - dev: https://testnet-api.ainetwork.ai
  - prod: https://mainnet-api.ainetwork.ai
- AIN_BLOCKCHAIN_CHAIN_ID
  - dev: 0
  - prod: 1

## How to Run
```bash
$ yarn
$ yarn dev
```

## How to deploy commands
```bash
$ tsc
$ node tools/deploy-commands.js
```

## How to invite discord bot in server
https://discord.com/oauth2/authorize?client_id=<APPLICATION_ID>&permissions=406411541568&scope=bot%20applications.commands