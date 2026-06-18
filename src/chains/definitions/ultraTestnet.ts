import * as Chain from '../../core/Chain.js'

export const ultraTestnet = /*#__PURE__*/ Chain.from({
  id: 18881,
  name: 'Ultra EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ultra Token',
    symbol: 'UOS',
  },
  rpcUrls: {
    default: { http: ['https://evm.test.ultra.eosusa.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Ultra EVM Testnet Explorer',
      url: 'https://evmexplorer.testnet.ultra.io',
    },
  },
  testnet: true,
})
