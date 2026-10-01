import {
  prepareTransactionRequest,
  sendRawTransactionSync,
  signTransaction,
} from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'

describe('frames: Frame', () => {
  test.each(['local', 'json-rpc'] as const)(
    '%s account with signing frames',
    async (type) => {
      const client = getClient({
        account: type === 'local' ? accounts[0] : accounts[0].address,
      })
      const prepared = await prepareTransactionRequest(client, {
        frames: [
          Frame.verify({ account: accounts[0] }),
          Frame.from(() => ({
            frame: {
              flags: 'approvePayment',
              mode: 'verify',
              to: accounts[1].address,
            },
            signatures: [
              {
                scheme: 'secp256k1',
                signer: accounts[1].address,
                async sign({ hash }) {
                  return accounts[1].sign({ hash })
                },
              },
            ],
          })),
          Frame.calls([{ to: accounts[1].address, value: 1n }]),
        ],
      })

      const serializedTransaction = await signTransaction(client, prepared)
      const receipt = await sendRawTransactionSync(client, {
        serializedTransaction,
      })

      expect(receipt.status).toBe('success')
      expect(receipt.payer?.toLowerCase()).toBe(
        accounts[1].address.toLowerCase(),
      )
      expect(prepared.signatures?.every(({ signature }) => !signature)).toBe(
        true,
      )
    },
  )

  test('preserves an explicitly signed frame', async () => {
    const client = getClient({ account: accounts[0] })
    const owner = { ...accounts[0] }
    const prepared = await prepareTransactionRequest(client, {
      frames: [
        Frame.verify({ account: owner }),
        Frame.from(() => ({
          frame: {
            flags: 'approvePayment',
            mode: 'verify',
            to: accounts[1].address,
          },
          signatures: [
            {
              scheme: 'secp256k1',
              signer: accounts[1].address,
              async sign({ hash }) {
                return accounts[1].sign({ hash })
              },
            },
          ],
        })),
      ],
    })
    const automatic = await signTransaction(client, prepared)
    const signed = await Frame.sign(prepared.frames[0]!, {
      transaction: prepared,
    })

    const explicit = await signTransaction(client, {
      ...prepared,
      frames: [signed, prepared.frames[1]!],
    })

    expect(explicit).toBe(automatic)
  })

  test('uses the chain serializer for signing frames', async () => {
    const client = getClient({ account: accounts[0] })
    const prepared = await prepareTransactionRequest(client, {
      frames: [Frame.verify({ account: accounts[0] })],
    })

    const result = await signTransaction(client, {
      ...prepared,
      chain: {
        ...client.chain,
        serializers: { transaction: () => '0x1234' as const },
      },
    })

    expect(result).toMatchInlineSnapshot(`"0x1234"`)
  })

  test('rejects changes after explicit frame signing', async () => {
    const client = getClient({ account: accounts[0] })
    const prepared = await prepareTransactionRequest(client, {
      frames: [Frame.verify({ account: accounts[0] })],
    })
    const signed = await Frame.sign(prepared.frames[0]!, {
      transaction: prepared,
    })

    await expect(
      signTransaction(client, {
        ...prepared,
        frames: [signed],
        nonce: prepared.nonce + 1,
      }),
    ).rejects.toThrow(
      'Frame.sign: transaction hash differs from the signed frame hash. Prepare and sign the modified transaction again.',
    )
  })

  test('propagates frame signing rejection', async () => {
    const client = getClient({ account: accounts[0] })
    const prepared = await prepareTransactionRequest(client, {
      frames: [
        Frame.verify({
          account: {
            ...accounts[0],
            async sign() {
              throw new Error('Frame signing rejected.')
            },
          },
        }),
      ],
    })

    await expect(signTransaction(client, prepared)).rejects.toThrow(
      'Frame signing rejected.',
    )
  })

  test('signs automatically inserted verification', async () => {
    const client = getClient({ account: accounts[0] })
    const prepared = await prepareTransactionRequest(client, {
      frames: [Frame.calls([{ to: accounts[1].address, value: 1n }])],
    })
    const serializedTransaction = await signTransaction(client, prepared)
    const receipt = await sendRawTransactionSync(client, {
      serializedTransaction,
    })

    expect(receipt.status).toBe('success')
  })
})
