import { fc, test } from '@fast-check/vitest'
import { Actions } from 'viem/tempo'
import { afterAll, beforeAll } from 'vitest'
import * as Tempo from '~test/tempo.js'
import * as FeePayer from '~test/tempo/feePayer.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'

const node = Tempo.defineNode()
let rpcUrl: string

const scenario = fc.record({
  feeToken: fc.constantFrom(...FeePayer.feeTokens),
  gas: fc.constantFrom(...FeePayer.gases),
  key: fc.constantFrom(...FeePayer.keys),
  nonceMode: fc.constantFrom(...FeePayer.nonceModes),
  path: fc.constantFrom(...FeePayer.paths),
  validity: fc.constantFrom(...FeePayer.validities),
})

beforeAll(async () => {
  rpcUrl = await node.start()
  await Actions.faucet.fundSync(Tempo.getClient({ rpcUrl }), {
    account: FeePayer.sponsor,
    timeout: 60_000,
  })
}, 120_000)
afterAll(() => node.stop())

test.prop(
  { scenario },
  fuzzParameters(5, { runsVariable: 'TEMPO_FUZZ_NODE_RUNS' }),
)('lands every sponsored scenario as requested', async ({ scenario }) => {
  await FeePayer.assertScenario(scenario, { rpcUrl })
})

test.prop(
  { tamper: fc.constantFrom(...FeePayer.tampers) },
  fuzzParameters(5, { runsVariable: 'TEMPO_FUZZ_NODE_RUNS' }),
)('rejects changes after the fee payer signs', async ({ tamper }) => {
  await FeePayer.assertTamperRejected(tamper, { rpcUrl })
})
