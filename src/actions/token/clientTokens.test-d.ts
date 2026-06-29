import { expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { publicActions } from '../../clients/decorators/public.js'
import { http } from '../../clients/transports/http.js'
import { usdc, usdce } from '../../tokens/index.js'
import { getBalance } from './getBalance.js'

const account = privateKeyToAccount(`0x${'1'.repeat(64)}`)

test('standalone: infers token names from client tokens', () => {
  const client = createClient({
    account,
    chain: mainnet,
    tokens: { usdc, usdce },
    transport: http(),
  })

  getBalance(client, { token: 'usdc' })
  getBalance(client, { token: '0x' })

  // @ts-expect-error usdce has no mainnet address.
  getBalance(client, { token: 'usdce' })
  // @ts-expect-error unknown name.
  getBalance(client, { token: 'nope' })
})

test('decorated client: keeps token-name inference', () => {
  const client = createClient({
    account,
    chain: mainnet,
    tokens: { usdc },
    transport: http(),
  }).extend(publicActions)

  client.token.getBalance({ token: 'usdc' })
  // @ts-expect-error usdce is not declared.
  client.token.getBalance({ token: 'usdce' })
})

test('no tokens: only address allowed', () => {
  const client = createClient({ account, chain: mainnet, transport: http() })
  getBalance(client, { token: '0x' })
  // @ts-expect-error no tokens declared.
  getBalance(client, { token: 'usdc' })
  expectTypeOf(client.tokens).toEqualTypeOf<undefined>()
})
