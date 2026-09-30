import { http, numberToHex } from 'viem'
import {
  prepareTransactionRequest,
  sendTransaction,
  sendTransactionSync,
} from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'
import { rpcUrl } from '~test/frames/prool.js'
import * as FrameTransaction from './internal/transaction.js'

describe('from: afterFill', () => {
  test('refills returned updates and keeps hooks out of protocol frames', async () => {
    const methods: string[] = []
    const client = getClient({
      account: accounts[0],
      transport: http(rpcUrl, {
        onFetchRequest: async (request) => {
          const body = await request.clone().json()
          methods.push(body.method)
          expect(JSON.stringify(body)).not.toContain('frameContext')
          expect(JSON.stringify(body)).not.toContain('afterFill')
          expect(JSON.stringify(body)).not.toContain('prepare')
        },
      }),
    })
    const frame = Frame.from((options) => {
      const { entries } = options
      return {
        name: 'custom',
        frame: { mode: 'sender', to: accounts[1].address },
        async afterFill(options) {
          const { transaction, frameIndex, entries: filledEntries } = options

          expect(filledEntries[frameIndex]!.name).toBe('custom')
          expect(entries.some((entry) => entry.name === 'custom')).toBe(true)
          return {
            frames: [
              {
                index: frameIndex,
                data: numberToHex(transaction.maxFeePerGas!),
              },
            ],
          }
        },
      }
    })
    const prepared = await prepareTransactionRequest(client, {
      frames: [frame],
      maxFeePerGas: 2_000_000_000n,
      maxPriorityFeePerGas: 1n,
    })
    expect(methods).toEqual(['eth_fillTransaction', 'eth_fillTransaction'])
    expect(
      prepared.frames!.every(
        (frame) => Object.getOwnPropertySymbols(frame).length === 0,
      ),
    ).toBe(true)
    expect(prepared.frames!.every((frame) => !('prepare' in frame))).toBe(true)
    expect(prepared.frames![1]!.data).toBe('0x77359400')
    expect(
      (prepared as FrameTransaction.Prepared<typeof prepared>).frameContext
        ?.entries[1]!.name,
    ).toBe('custom')

    methods.length = 0
    await prepareTransactionRequest(client, prepared)
    expect(methods).toEqual([])
    expect((await sendTransactionSync(client, prepared)).status).toBe('success')
  })

  test('preserves unsigned expansion hooks when adding automatic verification', async () => {
    const client = getClient({ account: accounts[0] })
    let calls = 0
    const prepared = await prepareTransactionRequest(client, {
      frames: [
        Frame.from(() => ({
          frames: [
            { mode: 'sender', to: accounts[1].address },
            { mode: 'sender', to: accounts[1].address },
          ],
          async afterFill(context) {
            calls++
            return { frames: [{ index: context.frameIndex, data: '0xabcd' }] }
          },
        })),
      ],
    })
    expect(calls).toBe(1)
    expect(prepared.frames.length).toBe(3)
    expect(prepared.frames[1]!.data).toMatchInlineSnapshot('"0xabcd"')
    expect((await sendTransactionSync(client, prepared)).status).toBe('success')
  })

  test.each([sendTransaction, sendTransactionSync])(
    'runs resolved unsigned hooks for JSON-RPC accounts (%s)',
    async (send) => {
      const client = getClient({ account: accounts[0].address })
      const resolved = FrameTransaction.resolve({
        frames: [
          {
            mode: 'verify',
            flags: 'approveExecutionAndPayment',
            to: accounts[0].address,
          },
          Frame.from(() => ({
            frame: { mode: 'sender', to: accounts[1].address },
            async afterFill() {
              throw new Error('Post-fill validation rejected the transaction.')
            },
          })),
        ],
        signatures: [{ scheme: 'secp256k1', signer: accounts[0].address }],
      })
      await expect(send(client, resolved)).rejects.toThrow(
        'Post-fill validation rejected the transaction.',
      )
    },
  )

  test('reuses a definition across independent preparations', async () => {
    const client = getClient({ account: accounts[0] })
    const frame = Frame.from(() => ({
      name: 'tip',
      frame: { mode: 'sender', to: accounts[1].address },
      async afterFill(options) {
        const { transaction, frameIndex } = options

        return {
          frames: [
            {
              index: frameIndex,
              data: numberToHex(transaction.maxPriorityFeePerGas!, { size: 1 }),
            },
          ],
        }
      },
    }))
    const [first, second] = await Promise.all(
      [1n, 2n].map((tip) =>
        prepareTransactionRequest(client, {
          frames: [frame],
          maxFeePerGas: 2_000_000_000n,
          maxPriorityFeePerGas: tip,
        }),
      ),
    )
    expect(first!.frames![1]!.data).toBe('0x01')
    expect(second!.frames![1]!.data).toBe('0x02')
    expect(
      (first! as FrameTransaction.Prepared<typeof first>).frameContext,
    ).not.toBe(
      (second! as FrameTransaction.Prepared<typeof second>).frameContext,
    )
  })
})
