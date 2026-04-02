import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../chainConfig.js'

const sourceId = 42431 // tempoModerato

export const zone006 = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 4217000006,
  name: 'Tempo Zone 006',
  contracts: {
    zonePortal: {
      address: '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23',
    },
  },
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-zone-006.tempoxyz.dev'],
    },
  },
  sourceId,
})
