import * as Chain from '../../core/Chain.js'

export const wanchainTestnet = /*#__PURE__*/ Chain.from({
  id: 999,
  name: 'Wanchain Testnet',
  nativeCurrency: { name: 'WANCHAIN', symbol: 'WANt', decimals: 18 },
  rpcUrls: {
    http: 'https://gwan-ssl.wandevs.org:46891',
  },
  blockExplorers: {
    name: 'WanScanTest',
    url: 'https://wanscan.org',
  },
  contracts: {
    multicall3: {
      address: '0x11c89bF4496c39FB80535Ffb4c92715839CC5324',
      blockCreated: 24743448,
    },
  },
  testnet: true,
})
