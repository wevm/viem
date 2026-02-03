import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const zksync = /*#__PURE__*/ defineChain({
  ...chainConfig,
  blockTime: 200,
  id: 324,
  name: 'ZKsync Era',
  network: 'zksync-era',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.era.zksync.io'],
      webSocket: ['wss://mainnet.era.zksync.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZKsync Explorer',
      url: 'https://explorer.zksync.io/',
      apiUrl: 'https://block-explorer-api.mainnet.zksync.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
    erc6492Verifier: {
      address: '0xfB688330379976DA81eB64Fe4BF50d7401763B9C',
      blockCreated: 45659388,
    },
  },
})
