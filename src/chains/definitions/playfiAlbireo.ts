import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const playfiAlbireo = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1_612_127,
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
