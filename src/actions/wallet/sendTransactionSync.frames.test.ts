import { Signature } from 'ox'
import { nonceManager as sharedNonceManager } from 'viem'
import { privateKeyToAccount, toAccount } from 'viem/accounts'
import {
  getBalance,
  getTransaction,
  getTransactionCount,
  prepareTransactionRequest,
  sendRawTransactionSync,
  sendTransaction,
  sendTransactionSync,
  signTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts as constants } from '~test/constants.js'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0] })
const request = {
  frames: [
    { flags: 'approveExecutionAndPayment', mode: 'verify' },
    { mode: 'sender', to: accounts[1].address, value: 1n },
  ],
  signatures: [{ scheme: 'secp256k1' }],
} as const

describe('frames: Frame', () => {
  test('keyed nonces advance independently of the account nonce', async () => {
    const initial = await getTransactionCount(client, {
      address: accounts[0].address,
    })
    for (const expected of [0, 1]) {
      const prepared = await prepareTransactionRequest(client, {
        nonceKeys: [123n, 456n],
        frames: [Frame.calls([{ to: accounts[1].address, value: 1n }])],
      })
      expect(prepared.nonce).toEqual(expected)
      const receipt = await sendTransactionSync(client, prepared)
      expect(receipt.status).toMatchInlineSnapshot(`"success"`)
      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.nonceKeys).toMatchInlineSnapshot(`
        [
          123n,
          456n,
        ]
      `)
      expect(transaction.nonce).toEqual(expected)
    }
    expect(
      await getTransactionCount(client, { address: accounts[0].address }),
    ).toEqual(initial)
  })

  test('rejects keys at different sequences', async () => {
    await sendTransactionSync(client, {
      nonceKeys: [789n],
      frames: [Frame.calls([{ to: accounts[1].address, value: 1n }])],
    })
    await expect(
      prepareTransactionRequest(client, {
        nonceKeys: [789n, 790n],
        frames: [Frame.calls([{ to: accounts[1].address, value: 1n }])],
      }),
    ).rejects.toThrow('Nonce keys must share the same sequence.')
  })

  test('rejects account nonce managers for keyed transactions', async () => {
    await expect(
      prepareTransactionRequest(client, {
        nonceKeys: [999n],
        nonceManager: sharedNonceManager,
        frames: [Frame.calls([{ to: accounts[1].address, value: 1n }])],
      }),
    ).rejects.toThrow('Nonce managers do not support keyed frame transactions.')
  })

  test('zero nonce key uses the account nonce', async () => {
    const nonce = await getTransactionCount(client, {
      address: accounts[0].address,
    })
    const receipt = await sendTransactionSync(client, {
      nonceKeys: [0n],
      frames: [Frame.calls([{ to: accounts[1].address, value: 1n }])],
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.nonceKeys).toMatchInlineSnapshot(`
      [
        0n,
      ]
    `)
    expect(transaction.nonce).toEqual(nonce)
  })

  test.each(['sendTransaction', 'sendTransactionSync'] as const)(
    'applies outer data suffixes to calls: %s',
    async (action) => {
      const suffixed = { ...client, dataSuffix: '0xdeadbeef' as const }
      const request = {
        frames: [
          Frame.calls([
            { to: accounts[1].address, value: 1n },
            { to: accounts[1].address, data: '0x12', dataSuffix: '0xab' },
          ]),
        ],
        dataSuffix: '0xcafe' as const,
      }
      const receipt =
        action === 'sendTransactionSync'
          ? await sendTransactionSync(suffixed, request)
          : await waitForTransactionReceipt(client, {
              hash: await sendTransaction(suffixed, request),
            })
      expect(receipt.status).toMatchInlineSnapshot(`"success"`)
      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(
        transaction.frames?.map((frame) => frame.data),
      ).toMatchInlineSnapshot(`
        [
          "0x",
          "0xcafe",
          "0x12ab",
        ]
      `)
    },
  )

  test('mixed signing', async () => {
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
        Frame.calls([{ to: accounts[1].address, value: 1n }]),
      ],
    })
    const signedOwner = await Frame.sign(prepared.frames[0]!, {
      transaction: prepared,
    })

    const receipt = await sendTransactionSync(client, {
      ...prepared,
      frames: [signedOwner, prepared.frames[1]!, prepared.frames[2]!],
    })

    expect(receipt.status).toBe('success')
    expect(receipt.payer?.toLowerCase()).toBe(accounts[1].address.toLowerCase())
  })

  test('verification also pays without a sponsor', async () => {
    const receipt = await sendTransactionSync(client, {
      frames: [
        Frame.verify({ account: accounts[0] }),
        Frame.calls([{ to: accounts[1].address, value: 1n }]),
      ],
    })

    expect(receipt.status).toBe('success')
  })

  test('rejects changed transactions after signing', async () => {
    const prepared = await prepareTransactionRequest(client, {
      frames: [
        Frame.verify({ account: accounts[0] }),
        Frame.calls([{ to: accounts[1].address, value: 1n }]),
      ],
    })
    const signed = await Frame.sign(prepared.frames[0]!, {
      transaction: prepared,
    })
    const request = { ...prepared, frames: [signed, prepared.frames[1]!] }

    await expect(
      sendTransactionSync(client, { ...request, nonce: prepared.nonce + 1 }),
    ).rejects.toThrow('transaction changed')
    await expect(
      sendTransactionSync(client, {
        ...request,
        maxFeePerGas: prepared.maxFeePerGas! + 1n,
      }),
    ).rejects.toThrow('transaction changed')
    await expect(
      sendTransactionSync(client, {
        ...request,
        frames: [signed, { ...prepared.frames[1]!, value: 2n }],
      }),
    ).rejects.toThrow('transaction changed')
    await expect(
      sendTransactionSync(client, {
        ...request,
        frames: [...request.frames].reverse(),
      }),
    ).rejects.toThrow('transaction changed')

    const receipt = await sendTransactionSync(client, request)
    expect(receipt.status).toBe('success')
  })

  test('automatic signing supports custom frames with multiple signatures', async () => {
    const custom = Frame.from(({ signatureIndex }) => {
      expect(signatureIndex).toBe(1)
      return {
        frame: { mode: 'default', to: accounts[1].address, data: '0x0102' },
        signatures: accounts.map((account, index) => ({
          scheme: 'secp256k1' as const,
          signer: account.address,
          async sign({
            hash,
            signatureIndex,
          }: Parameters<Frame.Signature['sign']>[0]) {
            expect(signatureIndex).toBe(index + 1)
            return Signature.fromHex(await account.sign({ hash }))
          },
        })),
      }
    })
    const receipt = await sendTransactionSync(client, {
      frames: [Frame.verify({ account: accounts[0] }), custom],
    })

    expect(receipt.status).toBe('success')
  })

  test('signing frames with an account address', async () => {
    const client = getClient({ account: accounts[0].address })
    const balance = await getBalance(client, { address: accounts[1].address })

    const receipt = await sendTransactionSync(client, {
      frames: [
        Frame.verify({ account: accounts[0] }),
        Frame.calls([{ to: accounts[1].address, value: 1n }]),
      ],
    })

    expect(receipt.status).toBe('success')
    expect(await getBalance(client, { address: accounts[1].address })).toBe(
      balance + 1n,
    )
  })

  test('does not broadcast when a frame signer rejects', async () => {
    const nonce = await getTransactionCount(client, {
      address: accounts[0].address,
    })

    await expect(
      sendTransactionSync(client, {
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
      }),
    ).rejects.toThrow('Frame signing rejected.')

    expect(
      await getTransactionCount(client, { address: accounts[0].address }),
    ).toBe(nonce)
  })
})

describe('frames: explicit', () => {
  test('default', async () => {
    const balance = await getBalance(client, { address: accounts[1].address })
    const receipt = await sendTransactionSync(client, request)

    expect(receipt.status).toBe('success')
    expect(await getBalance(client, { address: accounts[1].address })).toBe(
      balance + 1n,
    )
  })

  test('prepare, sign, and send', async () => {
    const balance = await getBalance(client, { address: accounts[1].address })
    const prepared = await prepareTransactionRequest(client, request)
    const serializedTransaction = await signTransaction(client, prepared)
    const receipt = await sendRawTransactionSync(client, {
      serializedTransaction,
    })

    expect(receipt.status).toBe('success')
    expect(await getBalance(client, { address: accounts[1].address })).toBe(
      balance + 1n,
    )
  })

  test('nonce manager resets after preparation failure', async () => {
    const account = privateKeyToAccount(constants[0].privateKey, {
      nonceManager: sharedNonceManager,
    })
    const nonce = await getTransactionCount(client, {
      address: account.address,
    })

    await expect(
      sendTransactionSync(client, {
        ...request,
        account,
        frames: [{ mode: 255 }],
      }),
    ).rejects.toThrow()
    expect(
      await getTransactionCount(client, { address: account.address }),
    ).toBe(nonce)

    const receipt = await sendTransactionSync(client, { ...request, account })
    expect(receipt.status).toBe('success')
    expect(
      await getTransactionCount(client, { address: account.address }),
    ).toBe(nonce + 1)
  })

  test('does not broadcast when signing is rejected', async () => {
    const account = toAccount({
      address: accounts[0].address,
      signMessage: accounts[0].signMessage,
      async signTransaction() {
        throw new Error('Signing rejected.')
      },
      signTypedData: accounts[0].signTypedData,
    })
    const nonce = await getTransactionCount(client, {
      address: account.address,
    })

    await expect(
      sendTransactionSync(client, { ...request, account }),
    ).rejects.toThrow('Signing rejected.')
    expect(
      await getTransactionCount(client, { address: account.address }),
    ).toBe(nonce)
  })
})
