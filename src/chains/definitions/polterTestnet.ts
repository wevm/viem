import { defineChain } from '../../utils/chain/defineChain.js'

export const polterTestnet = /*#__PURE__*/ defineChain({
  id: 631571,
  name: 'Polter Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Polter GHST',
    symbol: 'GHST',
  },
  rpcUrls: {
    default: {
      http: ['https://geist-polter.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://polter-testnet.explorer.alchemy.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11245,
    },
  },
  testnet: true,
})
