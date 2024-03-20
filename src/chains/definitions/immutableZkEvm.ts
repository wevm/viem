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
      address: '0x236bdA4589e44e6850f5aC6a74BfCa398a86c6c0',
      blockCreated: 4335972,
    },
  },
})
