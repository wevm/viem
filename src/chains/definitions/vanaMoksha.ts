import { defineChain } from '../../utils/chain/defineChain.js'

export const vanaMoksha = /*#__PURE__*/ defineChain({
  id: 14800,
  name: 'Vana Moksha Testnet',
  blockTime: 6_000,
  nativeCurrency: {
    decimals: 18,
    name: 'Vana',
    symbol: 'VANA',
  },
  rpcUrls: {
    default: { http: ['https://rpc.moksha.vana.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Vana Moksha Testnet',
      url: 'https://moksha.vanascan.io',
      apiUrl: 'https://moksha.vanascan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xD8d2dFca27E8797fd779F8547166A2d3B29d360E',
      blockCreated: 732283,
    },
  },
  testnet: true,
})
