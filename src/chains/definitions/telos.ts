import { defineChain } from '../../utils/chain/defineChain.js'

export const telos = /*#__PURE__*/ defineChain({
  id: 40,
  name: 'Telos',
  nativeCurrency: {
    decimals: 18,
    name: 'Telos',
    symbol: 'TLOS',
  },
  rpcUrls: {
    default: { http: ['https://rpc.telos.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Teloscan',
      url: 'https://www.teloscan.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 246530709,
    },
  },
})
