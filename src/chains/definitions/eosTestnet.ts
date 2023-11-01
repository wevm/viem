import { defineChain } from '../../utils/chain/defineChain.js'

export const eosTestnet = /*#__PURE__*/ defineChain({
  id: 15557,
  name: 'EOS EVM Testnet',
  network: 'eos',
  nativeCurrency: {
    decimals: 18,
    name: 'EOS',
    symbol: 'EOS',
  },
  rpcUrls: {
    default: { http: ['https://api.testnet.evm.eosnetwork.com'] },
    public: { http: ['https://api.testnet.evm.eosnetwork.com'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'EOS EVM Testnet Explorer',
      url: 'https://explorer.testnet.evm.eosnetwork.com',
    },
    default: {
      name: 'EOS EVM Testnet Explorer',
      url: 'https://explorer.testnet.evm.eosnetwork.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 9067940,
    },
  },
  testnet: true,
})
