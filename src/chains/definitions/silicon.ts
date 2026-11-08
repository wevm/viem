import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const silicon = /*#__PURE__*/ Chain.from({
  id: 2355,
  name: 'Silicon zkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: [
      'https://rpc.silicon.network',
      'https://silicon-mainnet.nodeinfra.com',
    ],
  },
  blockExplorers: {
    name: 'SiliconScope',
    url: 'https://scope.silicon.network',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
