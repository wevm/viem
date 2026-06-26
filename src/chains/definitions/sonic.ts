import { defineChain } from '../../utils/chain/defineChain.js'

export const sonic = /*#__PURE__*/ defineChain({
  id: 146,
  name: 'Sonic',
  blockTime: 630,
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://sonicscan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 60,
    },
  },
  tokens: {
    usdc: {
      address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'erc20',
    },
  },
  testnet: false,
})
