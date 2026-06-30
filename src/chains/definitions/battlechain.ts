import * as Chain from '../../core/Chain.js'

export const battlechain = /*#__PURE__*/ Chain.from({
  id: 626,
  name: 'BattleChain Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.battlechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BattleChain Explorer',
      url: 'https://explorer.battlechain.com',
      apiUrl: 'https://block-explorer-api.battlechain.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 40,
    },
  },
})
