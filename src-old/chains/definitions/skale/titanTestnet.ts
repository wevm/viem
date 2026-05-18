import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleTitanTestnet = /*#__PURE__*/ defineChain({
  id: 1_020_352_220,
  name: 'SKALE Titan Testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.skalenodes.com/v1/aware-fake-trim-testnet'],
      webSocket: ['wss://testnet.skalenodes.com/v1/ws/aware-fake-trim-testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://aware-fake-trim-testnet.explorer.testnet.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 104_072,
    },
  },
  testnet: true,
})
