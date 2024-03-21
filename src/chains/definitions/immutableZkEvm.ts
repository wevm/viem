import { defineChain } from '../../utils/chain/defineChain.js'

export const immutableZkEvm = /*#__PURE__*/ defineChain({
  id: 13371,
  name: 'Immutable zkEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'Immutable Coin',
    symbol: 'IMX',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.immutable.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Immutable Explorer',
      url: 'https://explorer.immutable.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x236bdA4589e44e6850f5aC6a74BfCa398a86c6c0',
      blockCreated: 4335972,
    },
  },
})
