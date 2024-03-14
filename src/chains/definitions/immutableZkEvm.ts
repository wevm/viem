import { defineChain } from '../../utils/chain/defineChain.js'

export const immutableZkEvm = /*#__PURE__*/ defineChain({
  id: 13371,
  name: 'Immutable zkEVM',
  testnet: false,
  network: 'immutable',
  nativeCurrency: {
    decimals: 18,
    name: 'Immutable Coin',
    symbol: 'IMX',
  },
  rpcUrls: {
    public: {
      http: ['https://rpc.immutable.com'],
    },
    default: {
      http: ['https://rpc.immutable.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Immutable Explorer',
      url: 'https://explorer.immutable.com/',
    },
    default: {
      name: 'Immutable Explorer',
      url: 'https://explorer.immutable.com/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xD51BFa777609213A653a2CD067c9A0132a2D316A',
      blockCreated: 1917421,
    },
  },
})
