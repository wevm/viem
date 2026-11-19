import type { Chain, ChainFormatters } from '../types/chain.js'
import type { Assign } from '../types/utils.js'
import {
  type DefineChainReturnType,
  defineChain,
} from '../utils/chain/defineChain.js'
import { type ChainConfig, chainConfig } from './chainConfig.js'

type Defaults = {
  nativeCurrency: {
    decimals: number
    name: string
    symbol: string
  }
  rpcUrls: { default: { http: string[] } }
  supportsTransactionReplacementDetection: boolean
}

type ZoneChain = Chain<ChainFormatters, ChainConfig['extendSchema']> & {
  formatters: ChainConfig['formatters']
}

/** Defines a Tempo Zone chain. */
export function from<const config extends from.Parameters>(
  config: config,
): from.ReturnValue<config>
export function from(config: from.Parameters) {
  const chain = {
    ...chainConfig,
    nativeCurrency: {
      name: 'USD',
      symbol: 'USD',
      decimals: 6,
    },
    rpcUrls: { default: { http: [] as string[] } },
    supportsTransactionReplacementDetection: false,
    ...config,
  }
  return defineChain(chain)
}

export declare namespace from {
  type Parameters = Pick<Chain, 'id' | 'name'> &
    Partial<Omit<Chain, 'id' | 'name' | 'sourceId'>> & {
      sourceId: number
    }

  type ReturnValue<config extends Parameters = Parameters> = Assign<
    Assign<DefineChainReturnType<ZoneChain>, Defaults>,
    config
  >
}

export const a = /*#__PURE__*/ from({
  id: 4_217_000_006,
  name: 'Zone A',
  rpcUrls: {
    default: {
      http: ['https://rpc-zone-a.testnet.tempo.xyz'],
    },
  },
  sourceId: 42_431,
})

export const b = /*#__PURE__*/ from({
  id: 4_217_000_007,
  name: 'Zone B',
  rpcUrls: {
    default: {
      http: ['https://rpc-zone-b.testnet.tempo.xyz'],
    },
  },
  sourceId: 42_431,
})

export const internal = /*#__PURE__*/ from({
  id: 421_700_001,
  name: 'Internal Zone',
  sourceId: 4_217, // tempo mainnet
})

export const internalTestnet = /*#__PURE__*/ from({
  id: 1_424_310_003,
  name: 'Internal Testnet Zone',
  sourceId: 42_431, // tempo testnet
})
