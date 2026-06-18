import * as Chain from '../../core/Chain.js'

export const hyperliquidEvmTestnet = /*#__PURE__*/ Chain.from({
  id: 998,
  name: 'Hyperliquid EVM Testnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
  },
  testnet: true,
})
