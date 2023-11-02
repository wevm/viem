import { defineChain } from '../../utils/chain/defineChain.js'

export const meter = /*#__PURE__*/ defineChain({
  id: 82,
  name: 'Meter',
  network: 'meter',
  nativeCurrency: {
    decimals: 18,
    name: 'MTR',
    symbol: 'MTR',
  },
  rpcUrls: {
    default: { http: ['https://rpc.meter.io'] },
    public: { http: ['https://rpc.meter.io'] },
  },
  blockExplorers: {
    default: { name: 'MeterScan', url: 'https://scan.meter.io' },
  },
})
