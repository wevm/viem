import { defineChain } from '../../utils/chain/defineChain.js'

export const immutableZkEvmTestnet = /*#__PURE__*/ defineChain({
  id: 13473,
  name: 'Immutable zkEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Immutable Coin',
    symbol: 'IMX',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.immutable.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Immutable Testnet Explorer',
      url: 'https://explorer.testnet.immutable.com/',
    },
  },
  contracts: {
    multicall3: {
      address: '0x2CC787Ed364600B0222361C4188308Fa8E68bA60',
      blockCreated: 5977391,
    },
  },
  testnet: true,
})
