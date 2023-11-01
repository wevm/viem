import { defineChain } from '../../utils/chain/defineChain.js'

export const wanchainTestnet = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'Wanchain Testnet',
  network: 'wanchainTestnet',
  nativeCurrency: { name: 'WANCHAIN', symbol: 'WANt', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://gwan-ssl.wandevs.org:46891'],
    },
    public: {
      http: ['https://gwan-ssl.wandevs.org:46891'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'WanScanTest',
      url: 'https://wanscan.org',
    },
    default: {
      name: 'WanScanTest',
      url: 'https://wanscan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0x11c89bF4496c39FB80535Ffb4c92715839CC5324',
      blockCreated: 24743448,
    },
  },
  testnet: true,
})
