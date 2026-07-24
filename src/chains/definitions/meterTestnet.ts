import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const meterTestnet = /*#__PURE__*/ Chain.from({
  id: 83,
  name: 'Meter Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MTR',
    symbol: 'MTR',
  },
  rpcUrls: { http: 'https://rpctest.meter.io' },
  blockExplorers: {
    name: 'MeterTestnetScan',
    url: 'https://scan-warringstakes.meter.io',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
