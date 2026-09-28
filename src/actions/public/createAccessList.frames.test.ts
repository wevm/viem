import { createAccessList } from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

describe('frames: Frame', () => {
  test('resolves call builders', async () => {
    const frame = {
      mode: 'sender' as const,
      to: accounts[1].address,
      value: 1n,
      executionGas: 50_000n,
      stateGas: 0n,
    }
    const verify = {
      mode: 'verify' as const,
      flags: 'approveExecutionAndPayment' as const,
      to: accounts[0].address,
      executionGas: 50_000n,
      stateGas: 0n,
    }
    const explicit = await createAccessList(client, {
      signatures: [{ scheme: 'secp256k1', signer: accounts[0].address }],
      frames: [verify, frame],
    })
    expect(
      await createAccessList(client, {
        frames: [
          Frame.verify({
            account: accounts[0],
            executionGas: 50_000n,
            stateGas: 0n,
          }),
          Frame.calls([
            {
              to: frame.to,
              value: frame.value,
              executionGas: frame.executionGas,
              stateGas: frame.stateGas,
            },
          ]),
        ],
      }),
    ).toEqual(explicit)
  })
})
