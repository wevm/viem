import { defineChain } from '../../utils/chain/defineChain.js'

export const bitlayerTestnet = /*#__PURE__*/ defineChain({
  id: 200810,
  name: 'Bitlayer Testnet',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.bitlayer.org'],
      webSocket: ['wss://testnet-ws.bitlayer.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'bitlayer testnet scan',
      url: 'https://testnet.btrscan.com',
    },
  },
  testnet: true,
})
