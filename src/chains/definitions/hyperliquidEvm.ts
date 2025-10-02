import { defineChain } from '../../utils/chain/defineChain.js'

export const hyperliquidEvm = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'HyperLiquid EVM',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://hyperliquid.drpc.org'],
      webSocket: ['wss://hyperliquid.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVMScan',
      url: 'https://hyperevmscan.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 13051,
    },
  },
  testnet: false,
})
