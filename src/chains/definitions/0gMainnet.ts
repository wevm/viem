import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const zeroGMainnet = /*#__PURE__*/ Chain.from({
  id: 16_661,
  name: '0G Mainnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    http: 'https://evmrpc.0g.ai',
  },
  blockExplorers: {
    name: '0G BlockChain Explorer',
    url: 'https://chainscan.0g.ai',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
