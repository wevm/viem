import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleBlockBrawlers = /*#__PURE__*/ defineChain({
  id: 391_845_894,
  name: 'SKALE | Block Brawlers',
  nativeCurrency: { name: 'BRAWL', symbol: 'BRAWL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.skalenodes.com/v1/frayed-decent-antares'],
      webSocket: ['wss://mainnet.skalenodes.com/v1/ws/frayed-decent-antares'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://frayed-decent-antares.explorer.mainnet.skalenodes.com',
    },
  },
  contracts: {},
})
