import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const gnosisChiado = /*#__PURE__*/ Chain.from({
  id: 10_200,
  name: 'Gnosis Chiado',
  nativeCurrency: {
    decimals: 18,
    name: 'Gnosis',
    symbol: 'xDAI',
  },
  blockTime: 5_000,
  rpcUrls: {
    http: 'https://rpc.chiadochain.net',
    ws: 'wss://rpc.chiadochain.net/wss',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://blockscout.chiadochain.net',
    apiUrl: 'https://blockscout.chiadochain.net/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4967313,
    },
  },
  testnet: true,
})
