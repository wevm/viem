import { defineChain } from '../../utils/chain/defineChain.js'
export const hyperevmTestnet = /*#__PURE__*/ defineChain({
  id: 998,
  name: 'HyperEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HyperEVM Testnet',
    symbol: 'Mock HYPE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] },
  },
  testnet: true,
})
