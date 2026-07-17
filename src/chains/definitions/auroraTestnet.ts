import * as Chain from '../../core/Chain.js'

export const auroraTestnet = /*#__PURE__*/ Chain.from({
  id: 1313161555,
  name: 'Aurora Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: { http: 'https://testnet.aurora.dev' },
  blockExplorers: {
    name: 'Aurorascan',
    url: 'https://testnet.aurorascan.dev',
    apiUrl: 'https://testnet.aurorascan.dev/api',
  },
  testnet: true,
})
