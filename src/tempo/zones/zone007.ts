import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../chainConfig.js'

const sourceId = 42431 // tempoModerato

export const zone007 = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 4217000007,
  name: 'Tempo Zone 007',
  contracts: {
    zonePortal: {
      address: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
    },
  },
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-zone-007.tempoxyz.dev'],
    },
  },
  sourceId,
})
