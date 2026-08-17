import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const rise = /*#__PURE__*/ Chain.from({
  id: 4153,
  name: 'RISE',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.risechain.com',
    ws: 'wss://rpc.risechain.com/ws',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://explorer.risechain.com',
    apiUrl: 'https://explorer.risechain.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
})
