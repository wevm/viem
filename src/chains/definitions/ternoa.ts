import * as Chain from '../../core/Chain.js'

export const ternoa = /*#__PURE__*/ Chain.from({
  id: 752025,
  name: 'Ternoa',
  nativeCurrency: { name: 'Capsule Coin', symbol: 'CAPS', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc-mainnet.zkevm.ternoa.network',
  },
  blockExplorers: {
    name: 'Ternoa Explorer',
    url: 'https://explorer-mainnet.zkevm.ternoa.network',
  },
  testnet: false,
})
