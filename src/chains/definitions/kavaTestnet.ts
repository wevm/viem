import * as Chain from '../../core/Chain.js'

export const kavaTestnet = /*#__PURE__*/ Chain.from({
  id: 2221,
  name: 'Kava EVM Testnet',
  nativeCurrency: {
    name: 'Kava',
    symbol: 'KAVA',
    decimals: 18,
  },
  rpcUrls: { http: 'https://evm.testnet.kava.io' },
  blockExplorers: {
    name: 'Kava EVM Testnet Explorer',
    url: 'https://testnet.kavascan.com/',
    apiUrl: 'https://testnet.kavascan.com/api',
  },
  contracts: {
    multicall3: {
      address: '0xDf1D724A7166261eEB015418fe8c7679BBEa7fd6',
      blockCreated: 7242179,
    },
  },
  testnet: true,
})
