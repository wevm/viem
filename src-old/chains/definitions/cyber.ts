import { defineChain } from '../../utils/chain/defineChain.js'

export const cyber = /*#__PURE__*/ defineChain({
  id: 7_560,
  name: 'Cyber',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://cyber.alt.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://cyberscan.co',
      apiUrl: 'https://cyberscan.co/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})
