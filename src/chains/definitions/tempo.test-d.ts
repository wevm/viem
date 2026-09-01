import { tempo, tempoModerato } from 'viem/chains'
import { expectTypeOf, test } from 'vitest'

test.each([tempo, tempoModerato])(
  '$name exposes canonical Earn factory address types',
  (chain) => {
    expectTypeOf(
      chain.contracts.earnFactory.address,
    ).toEqualTypeOf<'0xb5889A96114014d4C032ebD76772c10bF3b97137'>()
    expectTypeOf(
      chain.contracts.erc4626EngineFactory.address,
    ).toEqualTypeOf<'0xd43D00981222a8db444A528E69f19E3cE5A7D2Ff'>()
  },
)
