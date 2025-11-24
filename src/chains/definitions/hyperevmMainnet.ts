import { defineChain } from '../../utils/chain/defineChain.js'

export const hyperevmMainnet = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'HyperEVM Mainnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  testnet: false,
})
