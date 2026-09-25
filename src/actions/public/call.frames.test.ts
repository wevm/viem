import { call } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  const result = await call(client, {
    signatures: [{ scheme: 'secp256k1' }],
    frames: [
      {
        flags: 'approveExecutionAndPayment',
        executionGas: 50_000n,
        mode: 'verify',
      },
    ],
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "data": undefined,
    }
  `)
})

test('rejects EOA verification without a signature placeholder', async () => {
  await expect(
    call(client, {
      frames: [
        {
          flags: 'approveExecutionAndPayment',
          executionGas: 50_000n,
          stateGas: 0n,
          mode: 'verify',
        },
      ],
    }),
  ).rejects.toThrow('EIP-8141 VERIFY frame failed')
})
