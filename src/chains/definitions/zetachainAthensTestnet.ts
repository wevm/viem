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
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2715217,
    },
  },
  blockExplorers: {
    default: {
      name: 'ZetaScan',
      url: 'https://athens.explorer.zetachain.com',
    },
  },
  testnet: true,
})
