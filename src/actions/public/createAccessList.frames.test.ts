import { http } from 'viem'
import { createAccessList } from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'
import { rpcUrl } from '~test/frames/prool.js'
import * as FrameTransaction from '../../frames/internal/transaction.js'

const client = getClient({ account: accounts[0].address })

describe('frames: Frame', () => {
  test('includes arbitrary simulation placeholders without changing prepared signatures', async () => {
    const witnesses: unknown[] = []
    const client = getClient({
      account: accounts[0].address,
      transport: http(rpcUrl, {
        async onFetchRequest(request) {
          const body = await request.clone().json()
          if (body.method === 'eth_createAccessList')
            witnesses.push(body.params[0].signatures[1].signature)
        },
      }),
    })
    const prepared = FrameTransaction.resolve({
      frames: [
        Frame.verify({
          account: accounts[0],
          executionGas: 50_000n,
          stateGas: 0n,
        }),
        Frame.from(() => ({
          frame: {
            mode: 'sender',
            to: accounts[1].address,
            executionGas: 50_000n,
            stateGas: 0n,
          },
          signatures: [
            {
              scheme: 'arbitrary',
              placeholder: '0xaabb',
              sign: async () => '0xccdd',
            },
          ],
        })),
      ],
    })
    await createAccessList(client, prepared)
    expect(witnesses).toMatchInlineSnapshot(`
      [
        "0xaabb",
      ]
    `)
    expect(prepared.signatures![1]!.signature).toMatchInlineSnapshot('"0x"')
  })

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
