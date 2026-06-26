import { defineChain } from '../../utils/chain/defineChain.js'

export const polygonAmoy = /*#__PURE__*/ defineChain({
  id: 80_002,
  name: 'Polygon Amoy',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://amoy.polygonscan.com',
      apiUrl: 'https://api.etherscan.io/v2/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3127388,
    },
  },
  tokens: {
    usdc: {
      address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'erc20',
    },
  },
  testnet: true,
})
