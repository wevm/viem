import * as Contracts from '../../core/internal/contracts.js'
import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../tempo/chainConfig.js'

export const tempo = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 4217,
  blockExplorers: {
    name: 'Tempo Explorer',
    url: 'https://explore.tempo.xyz',
  },
  contracts: {
    create2: Contracts.create2,
    earnFactory: {
      address: '0x3085A8003f340CD51C72D9e1a1298CDafB171B02',
    },
    erc4626EngineFactory: {
      address: '0xd43D00981222a8db444A528E69f19E3cE5A7D2Ff',
    },
  },
  name: 'Tempo Mainnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    http: 'https://rpc.tempo.xyz',
    ws: 'wss://rpc.tempo.xyz',
  },
})
