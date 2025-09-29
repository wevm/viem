import { defineChain } from '../../utils/chain/defineChain.js'

export const hyperliquidEvm = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'Hyperliquid EVM',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  testnet: false,
})
