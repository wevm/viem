import { defineChain } from '../../utils/chain/defineChain.js'

export const arbitrumGoerli = /*#__PURE__*/ defineChain({
  id: 421_613,
  name: 'Arbitrum Goerli',
  nativeCurrency: {
    name: 'Arbitrum Goerli Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://goerli-rollup.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://goerli.arbiscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 88114,
    },
  },
  testnet: true,
})
