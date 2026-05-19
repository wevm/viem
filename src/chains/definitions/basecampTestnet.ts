import * as Chain from '../../core/Chain.js'

export const basecampTestnet = /*#__PURE__*/ Chain.define({
  id: 123420001114n,
  name: 'Basecamp Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Camp',
    symbol: 'CAMP',
  },
  rpcUrls: {
    default: { http: ['https://rpc.basecamp.t.raas.gelato.cloud'] },
  },
  blockExplorers: {
    default: {
      name: 'basecamp',
      url: 'https://basecamp.cloud.blockscout.com',
    },
  },
  testnet: true,
})
