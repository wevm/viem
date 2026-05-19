import * as Chain from '../../core/Chain.js'

export const kcc = /*#__PURE__*/ Chain.define({
  id: 321n,
  name: 'KCC Mainnet',
  network: 'KCC Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KCS',
    symbol: 'KCS',
  },
  rpcUrls: {
    default: {
      http: ['https://kcc-rpc.com'],
    },
  },
  blockExplorers: {
    default: { name: 'KCC Explorer', url: 'https://explorer.kcc.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11760430,
    },
  },
  testnet: false,
})
