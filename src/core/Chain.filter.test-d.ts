import { expectTypeOf, test } from 'vitest'

import { Chain } from 'viem'
import * as chains from 'viem/chains'
import { usdc } from 'viem/tokens'

test('narrows the chain id by token support', () => {
  const supported = Chain.filter({ chains, token: usdc })

  expectTypeOf(supported[0]).toMatchTypeOf<
    Chain.Chain & { id: keyof typeof usdc.addresses }
  >()
})

test('narrows the testnet flag', () => {
  const supported = Chain.filter({ chains, testnet: true, token: usdc })

  expectTypeOf(supported[0]).toMatchTypeOf<
    Chain.Chain & { id: keyof typeof usdc.addresses; testnet: true }
  >()
})
