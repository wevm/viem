import { defineChain } from '../../utils/chain/defineChain.js'

export const meterTestnet = /*#__PURE__*/ defineChain({
  id: 83,
  name: 'Meter Testnet',
  network: 'meter-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MTR',
    symbol: 'MTR',
  },
  rpcUrls: {
    default: { http: ['https://rpctest.meter.io'] },
    public: { http: ['https://rpctest.meter.io'] },
  },
  blockExplorers: {
    default: {
      name: 'MeterTestnetScan',
      url: 'https://scan-warringstakes.meter.io',
    },
  },
})
