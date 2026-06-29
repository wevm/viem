import { chainConfig } from '../../tempo/chainConfig.js'
import { alphausd } from '../../tokens/definitions/alphausd.js'
import { betausd } from '../../tokens/definitions/betausd.js'
import { eurce } from '../../tokens/definitions/eurce.js'
import { pathusd } from '../../tokens/definitions/pathusd.js'
import { thetausd } from '../../tokens/definitions/thetausd.js'
import { usdce } from '../../tokens/definitions/usdce.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const tempoModerato = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 42431,
  hardfork: 't5',
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
  testnet: true,
  tokens: {
    pathusd: pathusd(42431),
    usdce: usdce(42431),
    eurce: eurce(42431),
    alphausd: alphausd(42431),
    betausd: betausd(42431),
    thetausd: thetausd(42431),
  },
})
