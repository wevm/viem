import { chainConfig } from '../../linea/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const statusHoodi = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 374,
  name: 'Status Network Hoodi',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://public.hoodi.rpc.status.network'],
      webSocket: ['wss://public.hoodi.rpc.status.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://hoodiscan.status.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 780_627,
    },
  },
  testnet: true,
})
