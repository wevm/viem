import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleEuropaTestnet = /*#__PURE__*/ defineChain({
  id: 1_444_673_419,
  name: 'SKALE Europa Testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.skalenodes.com/v1/juicy-low-small-testnet'],
      webSocket: ['wss://testnet.skalenodes.com/v1/ws/juicy-low-small-testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://juicy-low-small-testnet.explorer.testnet.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 110_858,
    },
  },
  testnet: true,
})
