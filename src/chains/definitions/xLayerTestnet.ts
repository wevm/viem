import * as Chain from '../../core/Chain.js'

export const xLayerTestnet = /*#__PURE__*/ Chain.from({
  id: 1952,
  name: 'X1 Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  rpcUrls: { http: 'https://xlayertestrpc.okx.com' },
  blockExplorers: {
    name: 'OKLink',
    url: 'https://www.oklink.com/xlayer-test',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 624344,
    },
  },
  testnet: true,
})
