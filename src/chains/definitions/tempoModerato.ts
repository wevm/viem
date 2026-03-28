import { chainConfig } from '../../tempo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const tempoModerato = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 42431,
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.testnet.tempo.xyz',
    },
  },
  name: 'Tempo Testnet (Moderato)',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.moderato.tempo.xyz'],
      webSocket: ['wss://rpc.moderato.tempo.xyz'],
    },
  },
  zones: {
    26: {
      chainId: 4217000026,
      name: 'Tempo Zone 003',
      portalAddress: '0x0F1B0cEdd7e8226e39eCB161f522c8B1Ac45e9C8',
      rpcUrls: {
        default: {
          http: ['https://rpc-zone-003.tempoxyz.dev'],
          webSocket: ['wss://rpc-zone-003.tempoxyz.dev'],
        },
      },
    },
  },
})
