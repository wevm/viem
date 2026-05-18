import { defineChain } from '../../utils/chain/defineChain.js'

export const bifrost = /*#__PURE__*/ defineChain({
  id: 3068,
  name: 'Bifrost Mainnet',
  nativeCurrency: { name: 'BFC', symbol: 'BFC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://public-01.mainnet.bifrostnetwork.com/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bifrost Blockscout',
      url: 'https://explorer.mainnet.bifrostnetwork.com',
    },
  },
  testnet: false,
})
