import { defineChain } from '../../utils/chain/defineChain.js'

export const geist = /*#__PURE__*/ defineChain({
  id: 63157,
  name: 'Geist Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Aavegotchi GHST Token',
    symbol: 'GHST',
  },
  rpcUrls: {
    default: {
      http: ['https://geist-mainnet.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://geist-mainnet.explorer.alchemy.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 660735,
    },
  },
})
