import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const taikoHoodi = /*#__PURE__*/ Chain.from({
  id: 167_013,
  name: 'Taiko Hoodi',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.hoodi.taiko.xyz',
    ws: 'wss://ws.hoodi.taiko.xyz',
  },
  blockExplorers: {
    name: 'Etherscan',
    url: 'https://hoodi.taikoscan.io/',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 581116,
    },
  },
  testnet: true,
})
