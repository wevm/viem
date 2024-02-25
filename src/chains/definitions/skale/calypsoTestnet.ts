import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleCalypsoTestnet = /*#__PURE__*/ defineChain({
  id: 974_399_131,
  name: 'SKALE Calypso Testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.skalenodes.com/v1/giant-half-dual-testnet'],
      webSocket: ['wss://testnet.skalenodes.com/v1/ws/giant-half-dual-testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://giant-half-dual-testnet.explorer.testnet.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 103_220,
    },
  },
  testnet: true,
})
