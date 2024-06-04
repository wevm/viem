import { defineChain } from '../../utils/chain/defineChain.js'

export const btrTestnet = /*#__PURE__*/ defineChain({
  id: 200810,
  name: 'Bitlayer Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.bitlayer.org'],
      webSocket: [
        'wss://testnet-ws.bitlayer.org',
        'wss://testnet-ws.bitlayer-rpc.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'btrscan',
      url: 'https://testnet-scan.bitlayer.org',
      apiUrl: 'https://testnet-scan.bitlayer.org/apis',
    },
  },
  testnet: true,
})
