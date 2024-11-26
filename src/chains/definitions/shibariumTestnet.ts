import { defineChain } from '../../utils/chain/defineChain.js'

export const shibariumTestnet = /*#__PURE__*/ defineChain({
  id: 157,
  name: 'Puppynet Shibarium',
  nativeCurrency: {
    decimals: 18,
    name: 'Bone',
    symbol: 'BONE',
  },
  rpcUrls: {
    default: { http: ['https://puppynet.shibrpc.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://puppyscan.shib.io',
      apiUrl: 'https://puppyscan.shib.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xA4029b74FBA366c926eDFA7Dd10B21C621170a4c',
      blockCreated: 3035769,
    },
  },
  testnet: true,
})
