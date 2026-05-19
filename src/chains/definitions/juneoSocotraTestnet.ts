import * as Chain from '../../core/Chain.js'

export const juneoSocotraTestnet = /*#__PURE__*/ Chain.define({
  id: 101_003n,
  name: 'Socotra JUNE-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Socotra JUNE-Chain',
    symbol: 'JUNE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.socotra-testnet.network/ext/bc/JUNE/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://socotra.juneoscan.io/chain/2',
      apiUrl: 'https://socotra.juneoscan.io/chain/2/api',
    },
  },
  testnet: true,
})
