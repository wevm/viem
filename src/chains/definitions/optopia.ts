import * as Chain from '../../core/Chain.js'

export const optopia = /*#__PURE__*/ Chain.from({
  id: 62050,
  name: 'Optopia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-mainnet.optopia.ai'] },
  },
  blockExplorers: {
    default: {
      name: 'Optopia Explorer',
      url: 'https://scan.optopia.ai',
    },
  },
  testnet: false,
})
