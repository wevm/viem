import * as Chain from '../../core/Chain.js'

export const shibarium = /*#__PURE__*/ Chain.from({
  id: 109,
  name: 'Shibarium',
  nativeCurrency: { name: 'Bone', symbol: 'BONE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.shibrpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://shibariumscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0x864Bf681ADD6052395188A89101A1B37d3B4C961',
      blockCreated: 265900,
    },
  },
})
