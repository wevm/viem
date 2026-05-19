import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 5n // goerli

export const zoraTestnet = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 999n,
  name: 'Zora Goerli Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Zora Goerli',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.zora.energy'],
      webSocket: ['wss://testnet.rpc.zora.energy'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://testnet.explorer.zora.energy',
      apiUrl: 'https://testnet.explorer.zora.energy/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 189123,
    },
    portal: {
      [sourceId.toString()]: {
        address: '0xDb9F51790365e7dc196e7D072728df39Be958ACe',
      },
    },
  },
  sourceId,
  testnet: true,
})
