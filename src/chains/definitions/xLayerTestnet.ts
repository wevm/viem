import { defineChain } from '../../utils/chain/defineChain.js'

export const xLayerTestnet = /*#__PURE__*/ defineChain({
  id: 195,
  name: 'X1 Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  rpcUrls: {
    default: { http: ['https://x1testrpc.okx.com'] },
  },
  blockExplorers: {
    default: {
      name: 'OKLink',
      url: 'https://www.oklink.com/x1-test',
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

export { xLayerTestnet as x1Testnet }
