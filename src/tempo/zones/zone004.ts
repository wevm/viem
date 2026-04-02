import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../chainConfig.js'

const sourceId = 42431 // tempoModerato

export const zone004 = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 4217000028,
  name: 'Tempo Zone 004',
  contracts: {
    zonePortal: {
      address: '0xBa56d620FcC252cD04C54FB0D58a78EAb61DB68B',
    },
  },
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-zone-004.tempoxyz.dev'],
    },
  },
  sourceId,
})
