import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const battlechainTestnet = /*#__PURE__*/ Chain.from({
  id: 627,
  name: 'BattleChain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://testnet.battlechain.com',
  },
  blockExplorers: {
    name: 'BattleChain Explorer',
    url: 'https://explorer.testnet.battlechain.com',
    blockExplorerApi: 'https://block-explorer-api.testnet.battlechain.com/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
