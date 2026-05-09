import { defineChain } from '../../utils/chain/defineChain.js'

export const nitrographTestnet = /*#__PURE__*/ defineChain({
  id: 200024,
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
