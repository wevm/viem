import { fc, test } from '@fast-check/vitest'
import { Actions } from 'viem/tempo'
import { beforeAll } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import * as FeePayer from '~test/tempo/feePayer.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import { waitForBlock } from '~test/tempo/prool.js'

const scenario = fc.record({
  feeToken: fc.constantFrom(...FeePayer.feeTokens),
  gas: fc.constantFrom(...FeePayer.gases),
  key: fc.constantFrom(...FeePayer.keys),
  nonceMode: fc.constantFrom(...FeePayer.nonceModes),
  path: fc.constantFrom(...FeePayer.paths),
  validity: fc.constantFrom(...FeePayer.validities),
})

beforeAll(async () => {
  const client = Tempo.getClient({ chain: Tempo.chain })
  await waitForBlock(client)
  await Actions.faucet.fundSync(client, {
    account: FeePayer.sponsor,
    timeout: 60_000,
  })
}, 60_000)

test.prop(
  { scenario },
  fuzzParameters(5, { runsVariable: 'TEMPO_FUZZ_NODE_RUNS' }),
)('lands every sponsored scenario as requested', async ({ scenario }) => {
  await FeePayer.assertScenario(scenario)
})

test.prop(
  { tamper: fc.constantFrom(...FeePayer.tampers) },
  fuzzParameters(5, { runsVariable: 'TEMPO_FUZZ_NODE_RUNS' }),
)('rejects changes after the fee payer signs', async ({ tamper }) => {
  await FeePayer.assertTamperRejected(tamper)
})
