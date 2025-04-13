import { beforeAll, expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { reset } from '../../../actions/index.js'
import { getSupportedEntryPoints } from './getSupportedEntryPoints.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: 22239294n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
})

test('default', async () => {
  expect(await getSupportedEntryPoints(bundlerClient)).toMatchInlineSnapshot(`
    [
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
    ]
  `)
})
