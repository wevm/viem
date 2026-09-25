import { estimateGas } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  const result = await estimateGas(client, {
    signatures: [{ scheme: 'secp256k1' }],
    frames: [{ flags: 'approveExecutionAndPayment', mode: 'verify' }],
  })

  expect(result).toMatchInlineSnapshot(`15375n`)
})

test.todo('args: signatures')
