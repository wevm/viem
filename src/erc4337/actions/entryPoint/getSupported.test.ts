import { beforeAll, expect, test } from 'vitest'

import { Client, http } from 'viem'

import { bundler09, prepareEntryPoint09 } from '~test/bundler.js'
import { getSupported } from './getSupported.js'

const client = Client.create({ transport: http(bundler09.rpcUrl.http) })

beforeAll(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return
  await prepareEntryPoint09()
}, 60_000)

test('default', async () => {
  expect(await getSupported(client)).toMatchInlineSnapshot(`
    [
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
      "0x433709009B8330FDa32311DF1C2AFA402eD8D009",
    ]
  `)
})
