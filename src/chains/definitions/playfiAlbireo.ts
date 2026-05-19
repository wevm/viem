import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../internal/zksync.js'

export const playfiAlbireo = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 1_612_127n,
  name: 'PlayFi Albireo Testnet',
  network: 'albireo',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://albireo-rpc.playfi.ai'],
      webSocket: ['wss://albireo-rpc-ws.playfi.ai/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PlayFi Albireo Explorer',
      url: 'https://albireo-explorer.playfi.ai',
    },
  },
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
  testnet: true,
})
