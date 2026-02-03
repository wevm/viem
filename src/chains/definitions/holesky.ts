import { defineChain } from '../../utils/chain/defineChain.js'

export const holesky = /*#__PURE__*/ defineChain({
  id: 17000,
  name: 'Holesky',
  nativeCurrency: { name: 'Holesky Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ethereum-holesky-rpc.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://holesky.etherscan.io',
      apiUrl: 'https://api-holesky.etherscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 77,
    },
    ensUniversalResolver: {
      address: '0xeeeeeeee14d718c2b47d9923deab1335e144eeee',
      blockCreated: 4_295_055,
    },
  },
  testnet: true,
})
