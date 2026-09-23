import { estimateGas } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  const result = await estimateGas(client, {
    frames: [{ flags: 'approveExecutionAndPayment', mode: 'verify' }],
  })

  expect(result).toMatchInlineSnapshot(`12575n`)
})

test.todo('args: signatures')
