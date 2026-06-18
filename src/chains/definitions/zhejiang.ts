import * as Chain from '../../core/Chain.js'

export const zhejiang = /*#__PURE__*/ Chain.from({
  id: 1_337_803,
  name: 'Zhejiang',
  nativeCurrency: { name: 'Zhejiang Ether', symbol: 'ZhejETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.zhejiang.ethpandaops.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Beaconchain',
      url: 'https://zhejiang.beaconcha.in',
    },
  },
  testnet: true,
})
