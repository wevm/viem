import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const zeroGTestnet = /*#__PURE__*/ Chain.from({
  id: 16_602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: {
    http: 'https://evmrpc-testnet.0g.ai',
  },
  blockExplorers: {
    name: '0G BlockChain Explorer',
    url: 'https://chainscan-galileo.0g.ai',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
