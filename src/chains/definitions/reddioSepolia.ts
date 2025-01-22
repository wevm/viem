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
      address: '0x090241Dc01C66541169AF6eD13672212FD43D531',
      blockCreated: 3611828,
    },
  },
  testnet: true,
})
