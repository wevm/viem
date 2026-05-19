import * as Chain from '../../core/Chain.js'

export const kinto = /*#__PURE__*/ Chain.define({
  id: 7887n,
  name: 'Kinto Mainnet',
  network: 'Kinto Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.kinto.xyz/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Kinto Explorer',
      url: 'https://explorer.kinto.xyz',
    },
  },
  testnet: false,
})
