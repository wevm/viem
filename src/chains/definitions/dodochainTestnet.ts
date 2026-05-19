import * as Chain from '../../core/Chain.js'

export const dodochainTestnet = /*#__PURE__*/ Chain.define({
  id: 53457n,
  name: 'DODOchain Testnet',
  nativeCurrency: { decimals: 18, name: 'DODO', symbol: 'DODO' },
  rpcUrls: {
    default: {
      http: ['https://dodochain-testnet.alt.technology'],
      webSocket: ['wss://dodochain-testnet.alt.technology/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DODOchain Testnet (Sepolia) Explorer',
      url: 'https://testnet-scan.dodochain.com',
    },
  },
  testnet: true,
})
