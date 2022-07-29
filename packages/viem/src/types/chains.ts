export type BlockExplorer = {
  name: string
  url: string
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
  rpcUrls: { [key in 'alchemy' | 'public' | 'infura']?: string } & {
    [key: string]: string
    public: string
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
  | 'ropsten'
  | 'rinkeby'
  | 'goerli'
  | 'kovan'
  | 'optimism'
  | 'optimismKovan'
  | 'polygon'
  | 'polygonMumbai'
  | 'arbitrum'
  | 'arbitrumRinkeby'
export type AlchemyChain = Omit<Chain, 'network'> & {
  network: AlchemyChains
}

export type InfuraChains =
  | 'mainnet'
  | 'ropsten'
  | 'rinkeby'
  | 'goerli'
  | 'kovan'
  | 'optimism'
  | 'optimismKovan'
  | 'polygon'
  | 'polygonMumbai'
  | 'arbitrum'
  | 'arbitrumRinkeby'
export type InfuraChain = Omit<Chain, 'network'> & {
  network: InfuraChains
}

export type PublicChains =
  | 'mainnet'
  | 'ropsten'
  | 'rinkeby'
  | 'goerli'
  | 'kovan'
  | 'optimism'
  | 'optimismKovan'
  | 'polygon'
  | 'polygonMumbai'
  | 'arbitrum'
  | 'arbitrumRinkeby'
export type PublicChain = Omit<Chain, 'network'> & {
  network: PublicChains
}
