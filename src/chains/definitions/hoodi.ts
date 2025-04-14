import { defineChain } from '../../utils/chain/defineChain.js'

export const hoodi = /*#__PURE__*/ defineChain({
  id: 560048,
  name: 'Hoodi',
  nativeCurrency: { name: 'Hoodi Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hoodi.ethpandaops.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://hoodi.etherscan.io',
    },
  },
  testnet: true,
})
