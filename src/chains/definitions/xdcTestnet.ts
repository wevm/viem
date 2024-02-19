import { defineChain } from '../../utils/chain/defineChain.js'

export const xdcTestnet = /*#__PURE__*/ defineChain({
  id: 51,
  name: 'Apothem Network',
  nativeCurrency: {
    decimals: 18,
    name: 'TXDC',
    symbol: 'TXDC',
  },
  rpcUrls: {
    default: { http: ['https://erpc.apothem.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Blocksscan',
      url: 'https://apothem.blocksscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 59765389,
    },
  },
})
