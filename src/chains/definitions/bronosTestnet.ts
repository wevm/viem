import * as Chain from '../../core/Chain.js'

export const bronosTestnet = /*#__PURE__*/ Chain.define({
  id: 1038n,
  name: 'Bronos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bronos Coin',
    symbol: 'tBRO',
  },
  rpcUrls: {
    default: { http: ['https://evm-testnet.bronos.org'] },
  },
  blockExplorers: {
    default: {
      name: 'BronoScan',
      url: 'https://tbroscan.bronos.org',
    },
  },
  testnet: true,
})
