import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 5 // goerli

export const zoraTestnet = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 999,
  name: 'Zora Goerli Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Zora Goerli',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://testnet.rpc.zora.energy',
    ws: 'wss://testnet.rpc.zora.energy',
  },
  blockExplorers: {
    name: 'Explorer',
    url: 'https://testnet.explorer.zora.energy',
    apiUrl: 'https://testnet.explorer.zora.energy/api',
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 189123,
    },
    portal: {
      [sourceId]: {
        address: '0xDb9F51790365e7dc196e7D072728df39Be958ACe',
      },
    },
  },
  sourceId,
  testnet: true,
})
