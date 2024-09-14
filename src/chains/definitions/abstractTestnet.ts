import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const abstractTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 11_124,
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
      name: 'Abstract Block Explorer',
      url: 'https://explorer.testnet.abs.xyz',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
      blockCreated: 358349,
    },
  },
})
