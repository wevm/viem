import { defineChain } from '../../utils/chain/defineChain.js'

export const idchain = /*#__PURE__*/ defineChain({
  id: 74,
  name: 'IDChain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EIDI',
    symbol: 'EIDI',
  },
  rpcUrls: {
    default: {
      http: ['https://idchain.one/rpc'],
      webSocket: ['wss://idchain.one/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'IDChain Explorer',
      url: 'https://explorer.idchain.one',
    },
  },
  testnet: false,
})
