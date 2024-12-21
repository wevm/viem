import { defineChain } from '../../utils/chain/defineChain.js'

export const neoxMainnet = /*#__PURE__*/ defineChain({
  id: 47763,
  name: 'Neo X Mainnet',
  nativeCurrency: { name: 'Gas', symbol: 'GAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://mainnet-1.rpc.banelabs.org',
        'https://mainnet-2.rpc.banelabs.org',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Neo X - Explorer',
      url: 'https://xexplorer.neo.org',
    },
  },
  testnet: false,
})
