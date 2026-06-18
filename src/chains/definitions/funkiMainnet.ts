import * as Chain from '../../core/Chain.js'

const sourceId = 1 // mainnet

export const funkiMainnet = /*#__PURE__*/ Chain.from({
  id: 33979,
  name: 'Funki',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.funkichain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Funki Mainnet Explorer',
      url: 'https://funkiscan.io',
    },
  },
  contracts: {},
  sourceId,
})
