import { defineChain } from '../../utils/chain/defineChain.js'

export const potosTestnet = /*#__PURE__*/ defineChain({
  id: 60600,
  name: 'POTOS Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'POTOS Token',
    symbol: 'POT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.potos.hk'],
    },
  },
  blockExplorers: {
    default: {
      name: 'POTOS Testnet explorer',
      url: 'https://scan-testnet.potos.hk',
    },
  },
  testnet: true,
})
