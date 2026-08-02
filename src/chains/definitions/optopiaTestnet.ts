import * as Chain from '../../core/Chain.js'

export const optopiaTestnet = /*#__PURE__*/ Chain.from({
  id: 62049,
  name: 'Optopia Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { http: 'https://rpc-testnet.optopia.ai' },
  blockExplorers: {
    name: 'Optopia Explorer',
    url: 'https://scan-testnet.optopia.ai',
  },
  testnet: true,
})
