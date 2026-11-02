import { fc, test } from '@fast-check/vitest'
import { afterAll, beforeAll, describe, expect } from 'vitest'
import * as Tempo from '~test/tempo.js'
import * as BalanceDiffs from '~test/tempo/balanceDiffs.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'

const node = Tempo.defineNode()
let client: ReturnType<typeof Tempo.getClient>
let context: BalanceDiffs.Context

// Amounts straddle the sender's 100-token balances so some calls revert.
const amount = fc.oneof(
  fc.bigInt({ min: 0n, max: 1_000n }),
  fc.bigInt({ min: 1_000_000n, max: 150_000_000n }),
)
const party = fc.constantFrom(
  'other' as const,
  'second' as const,
  'self' as const,
)
const token = fc.integer({ min: 0, max: 3 })
const operation: fc.Arbitrary<BalanceDiffs.Operation> = fc.oneof(
  fc.record({
    amount,
    kind: fc.constant('approve' as const),
    spender: party,
    token,
  }),
  fc.record({ amount, kind: fc.constantFrom('buy' as const, 'sell' as const) }),
  fc.record({ amount, kind: fc.constant('liquidity' as const) }),
  fc.record({
    amount,
    kind: fc.constant('place' as const),
    side: fc.constantFrom('buy' as const, 'sell' as const),
  }),
  fc.record({ kind: fc.constant('preference' as const), token }),
  fc.record({
    amount,
    kind: fc.constantFrom('transfer' as const, 'transferFrom' as const),
    memo: fc.boolean(),
    to: party,
    token,
  }),
  fc.record({ amount, kind: fc.constant('withdraw' as const), token }),
)

beforeAll(async () => {
  const rpcUrl = await node.start()
  client = Tempo.getClient({ rpcUrl })
  context = await BalanceDiffs.setup(client, { rpcUrl })
}, 120_000)
afterAll(() => node.stop())

describe('balance diffs: node fuzz', () => {
  test.prop(
    { operations: fc.array(operation, { maxLength: 8, minLength: 1 }) },
    fuzzParameters(100, { runsVariable: 'TEMPO_FUZZ_NODE_RUNS' }),
  )(
    'match the sender balances and allowances after the calls',
    async ({ operations }) => {
      const { violations } = await BalanceDiffs.verify(client, {
        account: context.account,
        calls: operations.flatMap((operation) =>
          BalanceDiffs.build(context, operation),
        ),
      })

      expect(violations).toEqual([])
    },
  )
})
