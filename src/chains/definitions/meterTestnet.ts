import { defineChain } from '../../utils/chain.js'

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
    etherscan: { name: 'MeterTestnetScan', url: 'https://scan-warringstakes.meter.io' },
    default: { name: 'MeterTestnetScan', url: 'https://scan-warringstakes.meter.io' },
  },
  contracts: {
    
  },
})
