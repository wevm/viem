import { defineChain } from '../../utils/chain/defineChain.js'

export const blastMainnet = /*#__PURE__*/ defineChain({
  id: 238,
  name: 'Blast Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.blastblockchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blastscan',
      url: 'https://blastscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
  testnet: false,
})
