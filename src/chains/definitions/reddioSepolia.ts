import { defineChain } from '../../utils/chain/defineChain.js'

export const reddioSepolia = /*#__PURE__*/ defineChain({
  id: 50341,
  name: 'Reddio Sepolia',
  nativeCurrency: { name: 'Reddio', symbol: 'RED', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://reddio-dev.reddio.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Reddioscan',
      url: 'https://reddio-devnet.l2scan.co',
      apiUrl: 'https://reddio-devnet.l2scan.co/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xB74D5Dba3081bCaDb5D4e1CC77Cc4807E1c4ecf8',
      blockCreated: 7526064,
    },
  },
  testnet: true,
})
