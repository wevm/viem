import { defineChain } from '../../utils/chain/defineChain.js'

export const zetachainAthensTestnet = /*#__PURE__*/ defineChain({
  id: 7001,
  name: 'ZetaChain Athens Testnet',
  network: 'zetachain-athens-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Zeta',
    symbol: 'aZETA',
  },
  rpcUrls: {
    public: {
      http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
    },
    default: {
      http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZetaScan',
      url: 'https://athens3.explorer.zetachain.com',
    },
  },
  testnet: true,
})
