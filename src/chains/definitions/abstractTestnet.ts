import * as Chain from '../../core/Chain.js'

export const abstractTestnet = /*#__PURE__*/ Chain.define({
  blockTime: 200,
  id: 11_124n,
  name: 'Abstract Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://api.testnet.abs.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.abscan.org',
    },
    native: {
      name: 'Abstract Explorer',
      url: 'https://explorer.testnet.abs.xyz',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
      blockCreated: 358349,
    },
    erc6492Verifier: {
      address: '0xfB688330379976DA81eB64Fe4BF50d7401763B9C',
      blockCreated: 431682,
    },
  },
})
