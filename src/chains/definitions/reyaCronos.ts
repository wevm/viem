import { defineChain } from '../../utils/chain/defineChain.js'

export const reyaCronos = defineChain({
  id: 89346161,
  name: 'Reya Cronos',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: {
      http: ['https://rpc.reya-cronos.gelato.digital'],
      webSocket: ['wss://ws.reya-cronos.gelato.digital'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ReyaCronosExplorer',
      url: 'https://reya-cronos.blockscout.com',
    },
  },
  testnet: true,
})
