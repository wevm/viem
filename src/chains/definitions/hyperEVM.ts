import { defineChain } from '../../utils/chain/defineChain.js'

export const hyperEVM = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://hyperliquid.drpc.org'],
      webSocket: ['wss://hyperliquid.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVM Scan',
      url: 'https://hyperevmscan.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xbd23DbBDEC1e9EEfcd72ca53bBb307B0940769c0',
      blockCreated: 9956576,
    },
  },
  testnet: false,
})
