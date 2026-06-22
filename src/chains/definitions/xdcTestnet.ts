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
      name: 'XDCScan',
      url: 'https://testnet.xdcscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x7937b3878860eb3CDA14360cEaaa11a9646d941B',
      blockCreated: 83401816,
    },
  },
  testnet: true,
})
