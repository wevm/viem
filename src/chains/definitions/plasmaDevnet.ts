import * as Chain from '../../core/Chain.js'

export const plasmaDevnet = /*#__PURE__*/ Chain.from({
  id: 9747,
  name: 'Plasma Devnet',
  nativeCurrency: {
    name: 'Devnet Plasma',
    symbol: 'XPL',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://devnet-rpc.plasma.to',
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})
