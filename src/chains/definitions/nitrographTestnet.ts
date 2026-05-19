import * as Chain from '../../core/Chain.js'

export const nitrographTestnet = /*#__PURE__*/ Chain.define({
  id: 200024n,
  name: 'Nitrograph Testnet',
  testnet: true,
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.nitrograph.foundation'],
    },
  },
  nativeCurrency: {
    name: 'Nitro',
    symbol: 'NOS',
    decimals: 18,
  },
  blockExplorers: {
    default: {
      url: 'https://explorer-testnet.nitrograph.foundation',
      name: 'Nitrograph Explorer',
    },
  },
})
