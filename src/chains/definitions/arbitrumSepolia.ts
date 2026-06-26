import { defineChain } from '../../utils/chain/defineChain.js'

export const arbitrumSepolia = /*#__PURE__*/ defineChain({
  id: 421_614,
  name: 'Arbitrum Sepolia',
  blockTime: 250,
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://sepolia.arbiscan.io',
      apiUrl: 'https://api-sepolia.arbiscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 81930,
    },
  },
  tokens: {
    usdc: {
      address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'erc20',
    },
  },
  testnet: true,
})
