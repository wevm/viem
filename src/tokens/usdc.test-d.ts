import { expectTypeOf, test } from 'vitest'
import * as chains from '../chains/index.js'
import { type UsdcChainId, usdc } from './usdc.js'

declare const client: { chain: typeof chains.base }

test('UsdcChainId', () => {
  expectTypeOf<
    keyof (typeof usdc)['addresses']
  >().toEqualTypeOf<ExpectedUsdcChainId>()
  expectTypeOf<UsdcChainId>().toEqualTypeOf<ExpectedUsdcChainId>()
})

test('address', () => {
  expectTypeOf(usdc.address(chains.base.id)).toEqualTypeOf<
    (typeof usdc)['addresses'][8453]
  >()
  expectTypeOf(usdc.address(chains.base)).toEqualTypeOf<
    (typeof usdc)['addresses'][8453]
  >()
  expectTypeOf(usdc.address(client)).toEqualTypeOf<
    (typeof usdc)['addresses'][8453]
  >()
})

test('config', () => {
  expectTypeOf(usdc.config(chains.base)).toEqualTypeOf<{
    address: (typeof usdc)['addresses'][8453]
    abi: (typeof usdc)['abi']
  }>()
})

type ExpectedUsdcChainId =
  | (typeof chains.arbitrum)['id']
  | (typeof chains.arbitrumSepolia)['id']
  | (typeof chains.arcTestnet)['id']
  | (typeof chains.avalanche)['id']
  | (typeof chains.avalancheFuji)['id']
  | (typeof chains.base)['id']
  | (typeof chains.baseSepolia)['id']
  | (typeof chains.codex)['id']
  | (typeof chains.codexTestnet)['id']
  | (typeof chains.ink)['id']
  | (typeof chains.inkSepolia)['id']
  | (typeof chains.linea)['id']
  | (typeof chains.lineaSepolia)['id']
  | (typeof chains.mainnet)['id']
  | (typeof chains.optimism)['id']
  | (typeof chains.optimismSepolia)['id']
  | (typeof chains.polygon)['id']
  | (typeof chains.polygonAmoy)['id']
  | (typeof chains.sei)['id']
  | (typeof chains.seiTestnet)['id']
  | (typeof chains.sepolia)['id']
  | (typeof chains.sonic)['id']
  | (typeof chains.sonicBlazeTestnet)['id']
  | (typeof chains.unichain)['id']
  | (typeof chains.unichainSepolia)['id']
  | (typeof chains.worldchain)['id']
  | (typeof chains.worldchainSepolia)['id']
