import * as Chain from '../../core/Chain.js'

export const kava = /*#__PURE__*/ Chain.define({
  id: 2222n,
  name: 'Kava EVM',
  network: 'kava-mainnet',
  nativeCurrency: {
    name: 'Kava',
    symbol: 'KAVA',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://evm.kava.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Kava EVM Explorer',
      url: 'https://kavascan.com',
      apiUrl: 'https://kavascan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3661165,
    },
  },
  testnet: false,
})
