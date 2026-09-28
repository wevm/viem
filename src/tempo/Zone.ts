import * as Chain from '../core/Chain.js'
import type { Assign } from '../core/internal/types.js'
import { type ChainConfig, chainConfig } from './chainConfig.js'

type Defaults = {
  contracts: undefined
  nativeCurrency: {
    decimals: number
    name: string
    symbol: string
  }
  rpcUrls: { http: string[] }
  supportsTransactionReplacementDetection: boolean
}

/** Defines a Tempo Zone chain. */
export function from<const config extends from.Parameters>(
  config: config,
): from.ReturnValue<config>
export function from(config: from.Parameters) {
  const chain = {
    ...chainConfig,
    contracts: undefined,
    nativeCurrency: {
      name: 'USD',
      symbol: 'USD',
      decimals: 6,
    },
    rpcUrls: { http: [] as string[] },
    supportsTransactionReplacementDetection: false,
    ...config,
  }
  return Chain.from(chain)
}

export declare namespace from {
  type Parameters = Pick<Chain.Chain, 'id' | 'name'> &
    Partial<Omit<Chain.Chain, 'id' | 'name' | 'sourceId'>> & {
      sourceId: number
    }

  type ReturnValue<config extends Parameters = Parameters> = Assign<
    Assign<Chain.from.ReturnType<ChainConfig>, Defaults>,
    config
  >
}

export const a = /*#__PURE__*/ from({
  id: 4_217_000_006,
  name: 'Zone A',
  rpcUrls: { http: ['https://rpc-zone-a.testnet.tempo.xyz'] },
  sourceId: 42_431,
})

export const b = /*#__PURE__*/ from({
  id: 4_217_000_007,
  name: 'Zone B',
  rpcUrls: { http: ['https://rpc-zone-b.testnet.tempo.xyz'] },
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
