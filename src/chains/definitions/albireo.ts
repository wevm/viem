import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../zksync/chainConfig.js'

export const albireo = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1612127,
  name: 'PlayFi Albireo testnet',
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
      name: 'PlayFi Explorer',
      url: 'https://albireo-explorer.playfi.ai/',
    },
  },
  testnet: true,
})
