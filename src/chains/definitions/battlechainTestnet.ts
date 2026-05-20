import * as Chain from '../../core/Chain.js'

export const battlechainTestnet = /*#__PURE__*/ Chain.define({
  blockTime: 1_000,
  id: 627n,
  name: 'BattleChain Testnet',
  network: 'battlechain-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.battlechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BattleChain Explorer',
      url: 'https://explorer.testnet.battlechain.com',
      blockExplorerApi:
        'https://block-explorer-api.testnet.battlechain.com/api',
    },
  },
  testnet: true,
})
