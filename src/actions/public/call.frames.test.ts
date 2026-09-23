import { call } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  const result = await call(client, {
    frames: [
      { flags: 'approveExecutionAndPayment', gas: 50_000n, mode: 'verify' },
    ],
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "data": undefined,
    }
  `)
})

test.todo('args: signatures')
