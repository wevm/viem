import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleNebulaTestnet = /*#__PURE__*/ defineChain({
  id: 37_084_624,
  name: 'SKALE Nebula Testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.skalenodes.com/v1/lanky-ill-funny-testnet'],
      webSocket: ['wss://testnet.skalenodes.com/v1/ws/lanky-ill-funny-testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 105_141,
    },
  },
  testnet: true,
})
