import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../internal/zksync.js'

export const abstract = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  blockTime: 200,
  id: 2_741n,
  name: 'Abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet.abs.xyz'],
      webSocket: ['wss://api.mainnet.abs.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://abscan.org',
    },
    native: {
      name: 'Abstract Explorer',
      url: 'https://explorer.mainnet.abs.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xAa4De41dba0Ca5dCBb288b7cC6b708F3aaC759E7',
      blockCreated: 5288,
    },
    erc6492Verifier: {
      address: '0xfB688330379976DA81eB64Fe4BF50d7401763B9C',
      blockCreated: 5263,
    },
  },
})
