import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../chainConfig.js'

const sourceId = 42431 // tempoModerato

export const zone003 = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 4217000026,
  name: 'Tempo Zone 003',
  contracts: {
    zonePortal: {
      address: '0x0F1B0cEdd7e8226e39eCB161f522c8B1Ac45e9C8',
    },
  },
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-zone-003.tempoxyz.dev'],
    },
  },
  sourceId,
})
