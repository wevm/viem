import { defineChain } from '../../utils/chain/defineChain.js'

export const openledger = /*#__PURE__*/ defineChain({
  id: 1612,
  name: 'OpenLedger',
  nativeCurrency: { name: 'Open', symbol: 'OPEN', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.openledger.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'OpenLedger Explorer',
      url: 'https://scan.openledger.xyz',
    },
  },
  testnet: false,
})
