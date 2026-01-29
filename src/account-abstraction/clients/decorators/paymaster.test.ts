import { beforeEach, expect, test } from 'vitest'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { paymasterActions } from './paymaster.js'

const client = createClient({
  transport: http('https://'),
})

beforeEach(async () => {
  await bundlerMainnet.restart()
})

test('default', async () => {
  expect(paymasterActions(client)).toMatchInlineSnapshot(`
    {
      "getPaymasterData": [Function],
      "getPaymasterStubData": [Function],
    }
  `)
})
