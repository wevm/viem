import { defineChain } from '../../utils/chain/defineChain.js'

export const zetachainAthensTestnet = /*#__PURE__*/ defineChain({
  id: 7001,
  name: 'ZetaChain Athens Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Zeta',
    symbol: 'aZETA',
  },
  rpcUrls: {
    default: {
      http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZetaScan',
      url: 'https://athens.explorer.zetachain.com',
    },
    blockscout: {
      name: 'blockscout',
      url: 'https://zetachain-athens-3.blockscout.com',
    },
  },
  testnet: true,
})
