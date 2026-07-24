import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const taiko = /*#__PURE__*/ Chain.from({
  id: 167000,
  name: 'Taiko Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://rpc.mainnet.taiko.xyz',
    ws: 'wss://ws.mainnet.taiko.xyz',
  },
  blockExplorers: {
    name: 'Etherscan',
    url: 'https://taikoscan.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 11269,
    },
  },
})
