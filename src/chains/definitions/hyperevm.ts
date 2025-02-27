import { defineChain } from '../../utils/chain/defineChain.js'
export const hyperevm = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: {
      name: 'Purrsec',
      url: 'https://purrsec.com',
    },
  },
  testnet: false,
})