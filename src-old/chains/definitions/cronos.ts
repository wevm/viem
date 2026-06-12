import { defineChain } from '../../utils/chain/defineChain.js'

export const cronos = /*#__PURE__*/ defineChain({
  id: 25,
  name: 'Cronos Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Cronos',
    symbol: 'CRO',
  },
  rpcUrls: {
    default: { http: ['https://evm.cronos.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Cronos Explorer',
      url: 'https://explorer.cronos.org',
      apiUrl: 'https://explorer-api.cronos.org/mainnet/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1963112,
    },
  },
})
