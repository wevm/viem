import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hyperliquidEvmTestnet = /*#__PURE__*/ Chain.from({
  id: 998,
  name: 'Hyperliquid EVM Testnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.hyperliquid-testnet.xyz/evm',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
