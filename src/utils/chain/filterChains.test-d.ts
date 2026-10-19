import { describe, expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { getBalance } from '../../actions/token/getBalance.js'
import * as chains from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { publicActions } from '../../clients/decorators/public.js'
import { walletActions } from '../../clients/decorators/wallet.js'
import { http } from '../../clients/transports/http.js'
import { usdc, usdce } from '../../tokens/index.js'
import type { Chain } from '../../types/chain.js'
import { filterChains } from './filterChains.js'

const account = privateKeyToAccount(`0x${'1'.repeat(64)}`)

describe('filterChains', () => {
  test('narrows chain id by token support', () => {
    const supportedChains = filterChains({ chains, token: usdc })
    const chain = supportedChains[0]

    expectTypeOf(chain).toMatchTypeOf<
      Chain & { id: keyof typeof usdc.addresses }
    >()

    if (chain) {
      const client = createClient({
        account,
        chain,
        tokens: [usdc],
        transport: http(),
      })
      getBalance(client, { token: 'usdc' })
    }
  })

  test('narrows decorated client token actions by token support', () => {
    const supportedChains = filterChains({
      chains,
      sort: 'name',
      testnet: true,
      token: usdc,
    })
    const chain = supportedChains[0]

    expectTypeOf(chain).toMatchTypeOf<
      Chain & { id: keyof typeof usdc.addresses; testnet: true }
    >()

    if (chain) {
      const client = createClient({
        account,
        chain,
        tokens: [usdc],
        transport: http(),
      })
        .extend(publicActions)
        .extend(walletActions)

      client.token.getBalance({ token: 'usdc' })
      client.token.transfer({
        amount: { formatted: '1' },
        to: '0x',
        token: 'usdc',
      })
      // @ts-expect-error USDC.e is not declared on the client.
      client.token.getBalance({ token: 'usdc.e' })
    }
  })

  test('does not narrow token symbols without token support criteria', () => {
    const supportedChains = filterChains({ chains, testnet: true })
    const chain = supportedChains[0]

    if (chain) {
      const client = createClient({
        account,
        chain,
        tokens: [usdc, usdce],
        transport: http(),
      })

      // @ts-expect-error chain id is not known to support USDC.
      getBalance(client, { token: 'usdc' })
    }
  })
})
