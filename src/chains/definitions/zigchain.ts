import { defineChain } from '../../utils/chain/defineChain.js'

export const zigchain = /*#__PURE__*/ defineChain({
  id: 944,
  name: 'ZIGChain',
  nativeCurrency: { name: 'ZIG', symbol: 'ZIG', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://public-zigchain-evm-rpc.numia.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZIGScan',
      url: 'https://zigscan.org',
    },
  },
})
