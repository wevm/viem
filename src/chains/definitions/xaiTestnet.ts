import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const xaiTestnet = /*#__PURE__*/ Chain.from({
  id: 37714555429,
  name: 'Xai Testnet',
  nativeCurrency: { name: 'sXai', symbol: 'sXAI', decimals: 18 },
  rpcUrls: {
    http: 'https://testnet-v2.xai-chain.net/rpc',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://testnet-explorer-v2.xai-chain.net',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
