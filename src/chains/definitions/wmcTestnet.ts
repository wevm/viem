import * as Chain from '../../core/Chain.js'

export const wmcTestnet = /*#__PURE__*/ Chain.define({
  id: 42070n,
  name: 'WMC Testnet',
  nativeCurrency: { name: 'WMTx', symbol: 'WMTx', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet-base.worldmobile.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WMC Explorer',
      url: 'https://explorer2-base-testnet.worldmobile.net',
    },
  },
  testnet: true,
})
