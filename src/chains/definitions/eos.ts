import { defineChain } from '../../utils/chain/defineChain.js'

export const eos = /*#__PURE__*/ defineChain({
  id: 17777,
  name: 'EOS EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'EOS',
    symbol: 'EOS',
  },
  rpcUrls: {
    default: { http: ['https://api.evm.eosnetwork.com'] },
  },
  blockExplorers: {
    default: {
      name: 'EOS EVM Explorer',
      url: 'https://explorer.evm.eosnetwork.com',
      apiUrl: 'https://explorer.evm.eosnetwork.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 7943933,
    },
  },
})
