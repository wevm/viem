export type BlockExplorer = {
  name: string
  url: string
}

export type RpcUrl = {
  http: string
  webSocket?: string
}

export type Chain = {
  /** ID in number form */
  id: number
  /** Human-readable name */
  name: string
  /** Internal network name */
  network: string
  /** Currency used by chain */
  nativeCurrency?: {
    name: string
    /** 2-6 characters long */
    symbol: string
    decimals: number
  }
  /** Collection of RPC endpoints */
  rpcUrls: { [key in 'alchemy' | 'public' | 'infura' | 'local']?: RpcUrl } & {
    [key: string]: RpcUrl
    default: RpcUrl
  }
  /** Collection of block explorers */
  blockExplorers?: {
    etherscan?: BlockExplorer
    default: BlockExplorer
  }
  /** ENS registry */
  ens?: {
    address: string
  }
  /** Chain multicall contract */
  multicall?: {
    address: string
    blockCreated: number
  }
  /** Flag for test networks */
  testnet?: boolean
}

export type AlchemyChains =
  | 'mainnet'
  | 'goerli'
  | 'optimism'
  | 'optimismGoerli'
  | 'polygon'
  | 'polygonMumbai'
  | 'arbitrum'
  | 'arbitrumGoerli'
export type AlchemyChain = Omit<Chain, 'network'> & {
  network: AlchemyChains
}

export type InfuraChains =
  | 'mainnet'
  | 'goerli'
  | 'optimism'
  | 'optimismGoerli'
  | 'polygon'
  | 'polygonMumbai'
  | 'arbitrum'
  | 'arbitrumGoerli'
export type InfuraChain = Omit<Chain, 'network'> & {
  network: InfuraChains
}

export type PublicChains =
  | 'mainnet'
  | 'goerli'
  | 'optimism'
  | 'optimismGoerli'
  | 'polygon'
  | 'polygonMumbai'
  | 'arbitrum'
  | 'arbitrumGoerli'
export type PublicChain = Omit<Chain, 'network'> & {
  network: PublicChains
}

const defaultAlchemyApiKey = '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC'

function createChain<TChain extends Chain>(chain: TChain): TChain {
  return chain
}

export const mainnet = createChain({
  id: 1,
  network: 'mainnet',
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: 'https://eth-mainnet.alchemyapi.io/v2',
      webSocket: 'wss://eth-mainnet.g.alchemy.com/v2',
    },
    default: {
      http: 'https://eth-mainnet.alchemyapi.io/v2/' + defaultAlchemyApiKey,
      webSocket: 'wss://eth-mainnet.g.alchemy.com/v2/' + defaultAlchemyApiKey,
    },
    infura: {
      http: 'https://mainnet.infura.io/v3',
      webSocket: 'wss://mainnet.infura.io/ws/v3',
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  },
  ens: {
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  },
  multicall: {
    address: '0xca11bde05977b3631167028862be2a173976ca11',
    blockCreated: 14353601,
  },
} as const)

export const goerli = createChain({
  id: 5,
  name: 'Goerli',
  network: 'goerli',
  nativeCurrency: { name: 'Goerli Ether', symbol: 'GOR', decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: 'https://eth-goerli.alchemyapi.io/v2',
      webSocket: 'wss://eth-goerli.g.alchemy.com/v2',
    },
    default: {
      http: 'https://eth-goerli.alchemyapi.io/v2/' + defaultAlchemyApiKey,
      webSocket: 'wss://eth-goerli.g.alchemy.com/v2/' + defaultAlchemyApiKey,
    },
    infura: {
      http: 'https://goerli.infura.io/v3',
      webSocket: 'wss://goerli.infura.io/ws/v3',
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://goerli.etherscan.io',
    },
    default: {
      name: 'Etherscan',
      url: 'https://goerli.etherscan.io',
    },
  },
  ens: {
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  },
  multicall: {
    address: '0xca11bde05977b3631167028862be2a173976ca11',
    blockCreated: 6507670,
  },
  testnet: true,
} as const)

export const sepolia = createChain({
  id: 11_155_111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
  rpcUrls: {
    default: {
      http: 'https://rpc.sepolia.online',
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://goerli.etherscan.io',
    },
    default: {
      name: 'Etherscan',
      url: 'https://goerli.etherscan.io',
    },
  },
  ens: {
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  },
  multicall: {
    address: '0xca11bde05977b3631167028862be2a173976ca11',
    blockCreated: 6507670,
  },
  testnet: true,
} as const)

export const optimism = createChain({
  id: 10,
  name: 'Optimism',
  network: 'optimism',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: 'https://opt-mainnet.g.alchemy.com/v2',
      webSocket: 'wss://opt-mainnet.g.alchemy.com/v2',
    },
    infura: {
      http: 'https://optimism-mainnet.infura.io/v3',
      webSocket: 'wss://optimism-mainnet.infura.io/v3',
    },
    default: {
      http: 'https://opt-mainnet.g.alchemy.com/v2/' + defaultAlchemyApiKey,
      webSocket: 'wss://opt-mainnet.g.alchemy.com/v2/' + defaultAlchemyApiKey,
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://optimistic.etherscan.io',
    },
    default: {
      name: 'Etherscan',
      url: 'https://optimistic.etherscan.io',
    },
  },
  multicall: {
    address: '0xca11bde05977b3631167028862be2a173976ca11',
    blockCreated: 4286263,
  },
} as const)

export const optimismGoerli = createChain({
  id: 420,
  name: 'Optimism Goerli',
  network: 'optimismGoerli',
  nativeCurrency: {
    name: 'Goerli Ether',
    symbol: 'GOR',
    decimals: 18,
  },
  rpcUrls: {
    alchemy: {
      http: 'https://opt-goerli.g.alchemy.com/v2',
      webSocket: 'wss://opt-goerli.g.alchemy.com/v2',
    },
    infura: {
      http: 'https://optimism-goerli.infura.io/v3',
      webSocket: 'wss://optimism-goerli.infura.io/v3',
    },
    default: {
      http: 'https://opt-goerli.g.alchemy.com/v2/' + defaultAlchemyApiKey,
      webSocket: 'wss://opt-goerli.g.alchemy.com/v2/' + defaultAlchemyApiKey,
    },
  },
  blockExplorers: {
    blockscout: {
      name: 'Blockscout',
      url: 'https://blockscout.com/optimism/goerli',
    },
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.com/optimism/goerli',
    },
  },
  multicall: {
    address: '0xca11bde05977b3631167028862be2a173976ca11',
    blockCreated: 49461,
  },
  testnet: true,
} as const)

export const polygon = createChain({
  id: 137,
  name: 'Polygon',
  network: 'polygon',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: 'https://polygon-mainnet.g.alchemy.com/v2',
      webSocket: 'wss://polygon-mainnet.g.alchemy.com/v2',
    },
    infura: {
      http: 'https://polygon-mainnet.infura.io/v3',
      webSocket: 'wss://polygon-mainnet.infura.io/v3',
    },
    default: {
      http: 'https://polygon-mainnet.g.alchemy.com/v2/' + defaultAlchemyApiKey,
      webSocket:
        'wss://polygon-mainnet.g.alchemy.com/v2/' + defaultAlchemyApiKey,
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com',
    },
    default: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com',
    },
  },
  multicall: {
    address: '0xca11bde05977b3631167028862be2a173976ca11',
    blockCreated: 25770160,
  },
} as const)

export const polygonMumbai = createChain({
  id: 80001,
  name: 'Polygon Mumbai',
  network: 'polygonMumbai',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    alchemy: {
      http: 'https://polygon-mumbai.g.alchemy.com/v2',
      webSocket: 'wss://polygon-mumbai.g.alchemy.com/v2',
    },
    infura: {
      http: 'https://polygon-mumbai.infura.io/v3',
      webSocket: 'wss://polygon-mumbai.infura.io/v3',
    },
    default: {
      http: 'https://polygon-mumbai.g.alchemy.com/v2/' + defaultAlchemyApiKey,
      webSocket:
        'wss://polygon-mumbai.g.alchemy.com/v2/' + defaultAlchemyApiKey,
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'PolygonScan',
      url: 'https://mumbai.polygonscan.com',
    },
    default: {
      name: 'PolygonScan',
      url: 'https://mumbai.polygonscan.com',
    },
  },
  multicall: {
    address: '0xca11bde05977b3631167028862be2a173976ca11',
    blockCreated: 25444704,
  },
  testnet: true,
} as const)

export const arbitrum = createChain({
  id: 42161,
  name: 'Arbitrum One',
  network: 'arbitrum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: 'https://arb-mainnet.g.alchemy.com/v2',
      webSocket: 'wss://arb-mainnet.g.alchemy.com/v2',
    },
    infura: {
      http: 'https://arbitrum-mainnet.infura.io/v3',
      webSocket: 'wss://arbitrum-mainnet.infura.io/v3',
    },
    default: {
      http: 'https://arb-mainnet.g.alchemy.com/v2/' + defaultAlchemyApiKey,
      webSocket: 'wss://arb-mainnet.g.alchemy.com/v2/' + defaultAlchemyApiKey,
    },
  },
  blockExplorers: {
    arbitrum: {
      name: 'Arbitrum Explorer',
      url: 'https://explorer.arbitrum.io',
    },
    etherscan: { name: 'Arbiscan', url: 'https://arbiscan.io' },
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  },
  multicall: {
    address: '0xca11bde05977b3631167028862be2a173976ca11',
    blockCreated: 7654707,
  },
} as const)

export const arbitrumGoerli = createChain({
  id: 421613,
  name: 'Arbitrum Goerli',
  network: 'arbitrumGoerli',
  nativeCurrency: {
    name: 'Arbitrum Goerli Ether',
    symbol: 'ARETH',
    decimals: 18,
  },
  rpcUrls: {
    alchemy: {
      http: 'https://arb-goerli.g.alchemy.com/v2',
      webSocket: 'wss://arb-goerli.g.alchemy.com/v2',
    },
    infura: {
      http: 'https://arbitrum-goerli.infura.io/v3',
      webSocket: 'wss://arbitrum-goerli.infura.io/v3',
    },
    default: {
      http: 'https://arb-goerli.g.alchemy.com/v2/' + defaultAlchemyApiKey,
      webSocket: 'wss://arb-goerli.g.alchemy.com/v2/' + defaultAlchemyApiKey,
    },
  },
  blockExplorers: {
    arbitrum: {
      name: 'Arbitrum Explorer',
      url: 'https://goerli-rollup-explorer.arbitrum.io',
    },
    etherscan: { name: 'Arbiscan', url: 'https://testnet.arbiscan.io' },
    default: { name: 'Arbiscan', url: 'https://testnet.arbiscan.io' },
  },
  testnet: true,
} as const)

export const local = createChain({
  id: 1337,
  name: 'Localhost',
  network: 'localhost',
  rpcUrls: {
    local: { http: 'http://127.0.0.1:8545', webSocket: 'ws://127.0.0.1:8545' },
    default: {
      http: 'http://127.0.0.1:8545',
      webSocket: 'ws://127.0.0.1:8545',
    },
  },
} as const)
