import { createClient, http } from 'viem'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import * as FrameAfterFill from './afterFill.js'
import * as FrameTransaction from './transaction.js'

const client = createClient({ transport: http('http://127.0.0.1:1') })
const sender = '0x1111111111111111111111111111111111111111'

function request(hook: Frame.AfterFill) {
  return FrameTransaction.resolve({
    chainId: 8141,
    sender: sender as `0x${string}`,
    nonce: 0,
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 0n,
    frames: [
      Frame.from(() => ({
        name: 'test',
        frame: { mode: 'sender', executionGas: 100n, stateGas: 0n },
        afterFill: hook,
      })),
    ],
  })
}

describe('afterFill', () => {
  test('runs unchanged hooks once per transaction hash', async () => {
    let calls = 0
    const original = request(async () => {
      calls++
      return undefined
    })
    const prepared = await FrameAfterFill.afterFill(
      client,
      original,
      original.frames,
    )
    await FrameAfterFill.afterFill(client, prepared, original.frames)
    expect(calls).toBe(1)
    await FrameAfterFill.afterFill(
      client,
      { ...prepared, nonce: 1 },
      original.frames,
    )
    expect(calls).toBe(2)
    expect(original.frameContext?.afterFillHash).toBeUndefined()
  })

  test.each([-1, 1, 0.5])('rejects frame index %s', async (index) => {
    const transaction = request(async () => ({
      frames: [{ index, data: '0x12' }],
    }))
    await expect(
      FrameAfterFill.afterFill(client, transaction, transaction.frames),
    ).rejects.toThrow(
      'Frame.from: each `afterFill` patch index must be an integer within the transaction frame array.',
    )
  })

  test('rejects conflicting patches', async () => {
    const transaction = request(async () => ({
      frames: [
        { index: 0, data: '0x12' },
        { index: 0, data: '0x34' },
      ],
    }))
    await expect(
      FrameAfterFill.afterFill(client, transaction, transaction.frames),
    ).rejects.toThrow(
      'Frame.from: multiple `afterFill` patches target the same frame index.',
    )
  })

  test('bounds unsuccessful validation attempts', async () => {
    let attempts = 0
    const transaction = request(async () => {
      attempts++
      return { frames: [], validate: () => false }
    })
    await expect(
      FrameAfterFill.afterFill(client, transaction, transaction.frames),
    ).rejects.toThrow(
      'Frame.from: `afterFill` gas validation failed after three fill attempts.',
    )
    expect(attempts).toBe(3)
  })

  test('does not invoke hooks after signing', async () => {
    let invoked = false
    const transaction = request(async () => {
      invoked = true
      return undefined
    })
    await expect(
      FrameAfterFill.afterFill(
        client,
        {
          ...transaction,
          signatures: [{ scheme: 'arbitrary', signature: '0x12' }],
        },
        transaction.frames,
      ),
    ).rejects.toThrow(
      'Frame.from: `afterFill` cannot update a transaction containing completed signatures.',
    )
    expect(invoked).toBe(false)
  })
})
