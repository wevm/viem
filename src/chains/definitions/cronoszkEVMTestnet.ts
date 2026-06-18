import * as Chain from '../../core/Chain.js'

export const cronoszkEVMTestnet = /*#__PURE__*/ Chain.from({
  id: 282,
  name: 'Cronos zkEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Cronos zkEVM Test Coin',
    symbol: 'zkTCRO',
  },
  rpcUrls: {
    default: { http: ['https://testnet.zkevm.cronos.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Cronos zkEVM Testnet Explorer',
      url: 'https://explorer.zkevm.cronos.org/testnet',
    },
  },
  testnet: true,
})
