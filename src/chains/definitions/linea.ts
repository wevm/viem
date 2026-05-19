import { chainConfig } from '../internal/linea.js'
import * as Chain from '../../core/Chain.js'

export const linea = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 59_144n,
  name: 'Linea Mainnet',
  blockTime: 2000,
  nativeCurrency: { name: 'Linea Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.linea.build'],
      webSocket: ['wss://rpc.linea.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://lineascan.build',
      apiUrl: 'https://api.lineascan.build/api',
    },
  },
  contracts: {
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
