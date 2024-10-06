import { defineChain } from '../../utils/chain/defineChain.js'

export const bitlayer = /*#__PURE__*/ defineChain({
  id: 200901,
  name: 'Bitlayer Mainnet',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bitlayer.org'],
      webSocket: ['wss://ws.bitlayer.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'bitlayer mainnet scan',
      url: 'https://www.btrscan.com',
    },
  },
})
