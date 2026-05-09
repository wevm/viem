import { defineChain } from '../../utils/chain/defineChain.js'

export const ultraTestnet = /*#__PURE__*/ defineChain({
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
