import * as Chain from '../../core/Chain.js'

export const xLayerTestnet = /*#__PURE__*/ Chain.define({
  id: 1952n,
  name: 'X1 Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  rpcUrls: {
    default: { http: ['https://xlayertestrpc.okx.com'] },
  },
  blockExplorers: {
    default: {
      name: 'OKLink',
      url: 'https://www.oklink.com/xlayer-test',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 624344,
    },
  },
  testnet: true,
})
