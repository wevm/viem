import { defineChain } from '../../utils/chain/defineChain.js'

export const fluenceStage = /*#__PURE__*/ defineChain({
  id: 123_420_000_220,
  name: 'Fluence Stage',
  nativeCurrency: { name: 'tFLT', symbol: 'tFLT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.stage.fluence.dev'],
      webSocket: ['wss://ws.stage.fluence.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.stage.fluence.dev',
      apiUrl: 'https://blockscout.stage.fluence.dev/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 83227,
    },
  },
  testnet: true,
})
