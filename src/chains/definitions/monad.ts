import { defineChain } from '../../utils/chain/defineChain.js'

export const monad = /*#__PURE__*/ defineChain({
  id: 143,
  name: 'Monad',
  blockTime: 400,
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz', 'https://rpc1.monad.xyz'],
      webSocket: ['wss://rpc.monad.xyz', 'wss://rpc1.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadVision',
      url: 'https://monadvision.com',
    },
    monadscan: {
      name: 'Monadscan',
      url: 'https://monadscan.com',
      apiUrl: 'https://api.monadscan.com/api',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 9248132,
    },
  },
})
