import * as Chain from '../../core/Chain.js'

export const optopiaTestnet = /*#__PURE__*/ Chain.define({
  id: 62049n,
  name: 'Optopia Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.optopia.ai'] },
  },
  blockExplorers: {
    default: {
      name: 'Optopia Explorer',
      url: 'https://scan-testnet.optopia.ai',
    },
  },
  testnet: true,
})
