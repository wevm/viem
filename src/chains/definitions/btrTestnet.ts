import { defineChain } from '../../utils/chain/defineChain.js'

export const btrTestnet = /*#__PURE__*/ defineChain({
  id: 200810,
  name: 'Bitlayer Testnet',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
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
      name: 'Bitlayer(BTR) Scan',
      url: 'https://testnet.btrscan.com/',
      apiUrl: 'https://testnet.btrscan.com/apis',
    },
  },
  contracts: {
    multicall3: {
      address: '0x5b256fe9e993902ece49d138a5b1162cbb529474',
      blockCreated: 4135671,
    },
  },
  testnet: true,
})
