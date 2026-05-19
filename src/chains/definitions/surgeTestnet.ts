import * as Chain from '../../core/Chain.js'

export const surgeTestnet = /*#__PURE__*/ Chain.define({
  id: 763_375n,
  name: 'Surge Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://l2-rpc.hoodi.surge.wtf'],
      webSocket: ['wss://l2-ws.hoodi.surge.wtf'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Surge Testnet Blockscout',
      url: 'https://explorer.hoodi.surge.wtf',
    },
  },
  testnet: true,
})
