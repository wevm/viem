import { defineChain } from '../../utils/chain/defineChain.js'

export const immutableZkEvmTestnet = defineChain({
  id: 13473,
  name: 'Immutable Testnet',
  testnet: true,
  network: 'immutable',
  nativeCurrency: {
    decimals: 18,
    name: 'Immutable Coin',
    symbol: 'IMX',
  },
  rpcUrls: {
    public: {
      http: ['https://rpc.testnet.immutable.com'],
    },
    default: {
      http: ['https://rpc.testnet.immutable.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Immutable Testnet Explorer',
      url: 'https://explorer.testnet.immutable.com/',
    },
    default: {
      name: 'Immutable Testnet Explorer',
      url: 'https://explorer.testnet.immutable.com/',
    },
  },
  contracts: {
    multicall3: {
      address: '0x965B104e250648d01d4B3b72BaC751Cde809D29E',
      blockCreated: 3471259,
    },
  },
})
