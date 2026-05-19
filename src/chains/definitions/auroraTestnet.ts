import * as Chain from '../../core/Chain.js'

export const auroraTestnet = /*#__PURE__*/ Chain.define({
  id: 1313161555n,
  name: 'Aurora Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://testnet.aurora.dev'] },
  },
  blockExplorers: {
    default: {
      name: 'Aurorascan',
      url: 'https://testnet.aurorascan.dev',
      apiUrl: 'https://testnet.aurorascan.dev/api',
    },
  },
  testnet: true,
})
