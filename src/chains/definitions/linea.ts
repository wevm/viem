import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const linea = /*#__PURE__*/ Chain.from({
  id: 59_144,
  name: 'Linea Mainnet',
  blockTime: 2000,
  nativeCurrency: { name: 'Linea Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.linea.build',
    ws: 'wss://rpc.linea.build',
  },
  blockExplorers: {
    name: 'Etherscan',
    url: 'https://lineascan.build',
    apiUrl: 'https://api.lineascan.build/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 42,
    },
    ensRegistry: {
      address: '0x50130b669B28C339991d8676FA73CF122a121267',
      blockCreated: 6682888,
    },
    ensUniversalResolver: {
      address: '0x4D41762915F83c76EcaF6776d9b08076aA32b492',
      blockCreated: 22_222_151,
    },
  },
  ensTlds: ['.linea.eth'],
  testnet: false,
})
