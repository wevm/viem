import { defineChain } from '../../utils/chain/defineChain.js'

export const whitechainSepolia = /*#__PURE__*/ defineChain({
  testnet: true,
  id: 1874,
  name: 'Whitechain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'WBT',
    symbol: 'WBT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.whitechain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Whitechain Testnet Explorer',
      url: 'https://explorer.testnet.whitechain.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
})
