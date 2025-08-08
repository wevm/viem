import { chainConfig } from '../../linea/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const linea = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 59_144,
  name: 'Linea Mainnet',
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
      address: '0x3aA974fb3f8C1E02796048BDCdeD79e9D53a6965',
      blockCreated: 6683000,
    },
  },
  ensTlds: ['.linea.eth'],
  testnet: false,
})
