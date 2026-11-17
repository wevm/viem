import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const abstract = /*#__PURE__*/ Chain.from({
  blockTime: 200,
  id: 2_741,
  name: 'Abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://api.mainnet.abs.xyz',
    ws: 'wss://api.mainnet.abs.xyz/ws',
  },
  blockExplorers: {
    name: 'Etherscan',
    url: 'https://abscan.org',
  },
  contracts: {
    create2: Contracts.create2,
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
