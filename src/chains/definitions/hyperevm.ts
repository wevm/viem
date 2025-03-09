import { defineChain } from '../../utils/chain/defineChain.js'
export const hyperevm = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'HyperEVM',
    symbol: 'HYPE',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13051,
    },
  },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVM Explorer',
      url: 'https://hyperliquid.cloud.blockscout.com/',
    },
  },
  testnet: false,
})
