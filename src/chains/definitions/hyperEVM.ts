import { defineChain } from '../../utils/chain/defineChain.js'

export const hyperEVM = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'Hyperliquid EVM',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: {
      name: 'Hyperliquid EVM Explorer',
      url: 'https://hyperliquid.cloud.blockscout.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 13_051,
    },
  },
  testnet: false,
})
