import { MultisigConfig, SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import {
  Actions,
  Addresses,
  FundingPolicy,
  FundingRequirement,
  FundingSource,
} from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import { prepareTransactionRequest, signTransaction } from '../actions/index.js'
import { nativeMultisigFactory } from './Addresses.js'
import * as Formatters from './Formatters.js'
import * as Transaction from './Transaction.js'

const client = getClient({
  account: accounts.at(0)!,
})

const token = '0x20c0000000000000000000000000000000000000' as const
const requirement = FundingRequirement.from({
  token,
  amount: 50_000_000n,
  slippageBps: 0,
  sources: [FundingSource.dex({ maxAmountIn: 30_000_000n, tokenIn: token })],
})

describe('getType', () => {
  test('behavior: calls', () => {
    expect(Transaction.getType({ calls: [{ to: '0x00' }] })).toBe('tempo')
  })

  test('behavior: feePayer', () => {
    expect(Transaction.getType({ feePayer: true })).toBe('tempo')
  })

  test('behavior: feeToken', () => {
    expect(Transaction.getType({ feeToken: '0x00' })).toBe('tempo')
  })

  test('behavior: keyAuthorization', () => {
    expect(Transaction.getType({ keyAuthorization: {} })).toBe('tempo')
  })

  test('behavior: multisigSimulation', () => {
    expect(Transaction.getType({ multisigSimulation: {} })).toBe('tempo')
  })

  test('behavior: nonceKey', () => {
    expect(Transaction.getType({ nonceKey: 1n })).toBe('tempo')
  })

  test('behavior: signature', () => {
    expect(Transaction.getType({ signature: {} })).toBe('tempo')
  })

  test('behavior: validBefore', () => {
    expect(Transaction.getType({ validBefore: 100 })).toBe('tempo')
  })

  test('behavior: validAfter', () => {
    expect(Transaction.getType({ validAfter: 100 })).toBe('tempo')
  })

  test('behavior: non-secp256k1 account keyType', () => {
    expect(Transaction.getType({ account: { keyType: 'p256' } })).toBe('tempo')
  })

  test('behavior: explicit type', () => {
    expect(Transaction.getType({ type: 'eip1559' })).toBe('eip1559')
  })

  test('behavior: infers type from transaction fields', () => {
    expect(Transaction.getType({ maxFeePerGas: 1n, chainId: 1 })).toBe(
      'eip1559',
    )
  })

  test('infers Tempo from funding alone', () => {
    expect(Transaction.getType({ requireFunds: [requirement] })).toBe('tempo')
    expect(Transaction.getType({ to: token, gasPrice: 1n })).not.toBe('tempo')
  })
})

describe('isTempo', () => {
  test('behavior: true for tempo transaction', () => {
    expect(Transaction.isTempo({ calls: [] })).toBe(true)
  })

  test('behavior: false for non-tempo transaction', () => {
    expect(Transaction.isTempo({ type: 'eip1559' })).toBe(false)
  })

  test('behavior: false when getType throws', () => {
    expect(Transaction.isTempo({})).toBe(false)
  })
})

describe('deserialize', () => {
  test('behavior: tempo transaction', async () => {
    const request = await prepareTransactionRequest(client, {
      to: '0x0000000000000000000000000000000000000000',
      feeToken,
    })
    const serialized = await signTransaction(client, request)
    const deserialized = Transaction.deserialize(serialized as `0x76${string}`)
    expect(deserialized.type).toBe('tempo')
    expect(deserialized.calls).toBeDefined()
  })

  test('behavior: tempo transaction in fee payer format', async () => {
    const request = await prepareTransactionRequest(client, {
      to: '0x0000000000000000000000000000000000000000',
      feePayer: true,
    })
    const serialized = await signTransaction(client, request)
    expect(serialized.startsWith('0x78')).toBe(true)
    const deserialized = Transaction.deserialize(serialized as `0x78${string}`)
    expect(deserialized.type).toBe('tempo')
    expect(
      (deserialized as { feePayerSignature: null }).feePayerSignature,
    ).toBeNull()
    expect(deserialized.from).toBe(accounts.at(0)!.address.toLowerCase())
  })

  test('behavior: non-tempo transaction', async () => {
    const { serializeTransaction } = await import(
      '../utils/transaction/serializeTransaction.js'
    )
    const serialized = serializeTransaction(
      {
        chainId: 1,
        to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        maxFeePerGas: 1000000000n,
        maxPriorityFeePerGas: 1000000000n,
        gas: 21000n,
        nonce: 0,
        type: 'eip1559',
      },
      {
        r: '0x0000000000000000000000000000000000000000000000000000000000000001',
        s: '0x0000000000000000000000000000000000000000000000000000000000000001',
        yParity: 0,
      },
    )
    const deserialized = Transaction.deserialize(serialized)
    expect(deserialized.type).toBe('eip1559')
  })
})

describe('serialize', () => {
  test('behavior: tempo transaction', async () => {
    const serialized = await Transaction.serialize({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feeToken,
    })
    expect(serialized.startsWith('0x76')).toBe(true)
  })

  test('behavior: tempo transaction with signature', async () => {
    const serialized = await Transaction.serialize(
      {
        chainId: 1,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        feeToken,
      },
      {
        type: 'secp256k1',
        signature: { r: 1n, s: 1n, yParity: 0 },
      },
    )
    expect(serialized.startsWith('0x76')).toBe(true)
  })

  test('behavior: non-tempo transaction', async () => {
    const serialized = await Transaction.serialize({
      chainId: 1,
      to: '0x0000000000000000000000000000000000000000',
      maxFeePerGas: 1000n,
      maxPriorityFeePerGas: 100n,
      gas: 21000n,
      nonce: 0,
    })
    expect(serialized.startsWith('0x02')).toBe(true)
  })

  test('behavior: non-tempo transaction with secp256k1 SignatureEnvelope', async () => {
    const serialized = await Transaction.serialize(
      {
        chainId: 1,
        to: '0x0000000000000000000000000000000000000000',
        maxFeePerGas: 1000n,
        maxPriorityFeePerGas: 100n,
        gas: 21000n,
        nonce: 0,
      },
      { type: 'secp256k1', signature: { r: 1n, s: 1n, yParity: 0 } },
    )
    expect(serialized.startsWith('0x02')).toBe(true)
  })

  test('behavior: throws for non-tempo with non-secp256k1 signature', async () => {
    await expect(
      Transaction.serialize(
        {
          chainId: 1,
          to: '0x0000000000000000000000000000000000000000',
          maxFeePerGas: 1000n,
          maxPriorityFeePerGas: 100n,
          gas: 21000n,
          nonce: 0,
        },
        {
          type: 'p256',
          signature: { r: 1n, s: 1n },
          prehash: true,
          publicKey: { prefix: 4, x: 1n, y: 1n },
        },
      ),
    ).rejects.toThrow('Unsupported signature type. Expected `secp256k1`')
  })

  test('behavior: serializes with feePayer: true', async () => {
    const serialized = await Transaction.serialize({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feePayer: true,
    })
    expect(serialized.startsWith('0x76')).toBe(true)
  })

  test('behavior: serializes with feePayer: true and signature uses feePayer format', async () => {
    const serialized = await Transaction.serialize(
      {
        chainId: 1,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        feePayer: true,
        from: accounts.at(0)!.address,
      },
      { type: 'secp256k1', signature: { r: 1n, s: 1n, yParity: 0 } },
    )
    expect(serialized.startsWith('0x78')).toBe(true)
  })

  test('behavior: feePayer: true strips feeToken from sender sign payload', async () => {
    const unsigned = await Transaction.serialize({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feePayer: true,
      feeToken,
    })
    const unsignedParsed = Transaction.deserialize(unsigned as `0x76${string}`)
    expect(unsignedParsed.feeToken).toBeUndefined()
  })

  test('behavior: feePayer: true strips feeToken from sender sign payload even when feePayerSignature is set', async () => {
    // Sender's payload must still omit feeToken so its recovered address
    // matches the one used when computing the fee payer signature.
    const unsigned = await Transaction.serialize({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feePayer: true,
      feeToken,
      feePayerSignature: { r: '0x1', s: '0x1', yParity: 0 } as never,
    })
    const unsignedParsed = Transaction.deserialize(unsigned as `0x76${string}`)
    expect(unsignedParsed.feeToken).toBeUndefined()
  })

  test('behavior: pre-filled feePayerSignature strips feeToken from sender sign payload', async () => {
    const unsigned = await Transaction.serialize({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feeToken,
      feePayerSignature: { r: '0x1', s: '0x1', yParity: 0 } as never,
    })
    const unsignedParsed = Transaction.deserialize(unsigned as `0x76${string}`)
    expect(unsignedParsed.feeToken).toBeUndefined()
    expect(
      (unsignedParsed as { feePayerSignature: unknown }).feePayerSignature,
    ).toBeNull()
  })

  test('behavior: feePayer: true emits full envelope with both signatures (single round trip)', async () => {
    // Fee payer signature was prefilled during eth_fillTransaction -- emit
    // a full 0x76 envelope to skip eth_signRawTransaction.
    const signed = await Transaction.serialize(
      {
        chainId: 1,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        feePayer: true,
        feeToken,
        from: accounts.at(0)!.address,
        feePayerSignature: { r: '0x1', s: '0x1', yParity: 0 } as never,
      },
      { type: 'secp256k1', signature: { r: 1n, s: 1n, yParity: 0 } },
    )
    expect(signed.startsWith('0x76')).toBe(true)

    const parsed = Transaction.deserialize(signed as `0x76${string}`)
    expect((parsed.feeToken as string)?.toLowerCase()).toBe(
      feeToken.toLowerCase(),
    )
    expect(
      (parsed as { feePayerSignature: { r: string } }).feePayerSignature?.r,
    ).toBeDefined()
  })

  test('behavior: serializes with feePayer as object (co-signed)', async () => {
    const serialized = await Transaction.serialize(
      {
        chainId: 1,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        feePayer: accounts.at(1)!,
        from: accounts.at(0)!.address,
      },
      { type: 'secp256k1', signature: { r: 1n, s: 1n, yParity: 0 } },
    )
    expect(serialized.startsWith('0x76')).toBe(true)
  })

  test('behavior: feePayer object derives sender from p256 signature', async () => {
    const serialized = await Transaction.serialize(
      {
        chainId: 1,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        feePayer: accounts.at(1)!,
      },
      {
        type: 'p256',
        signature: { r: 1n, s: 1n },
        publicKey: { x: 1n, y: 1n, prefix: 4 },
        prehash: true,
      },
    )

    expect(serialized.startsWith('0x76')).toBe(true)
  })

  test('behavior: explicit nonce key preserves multisig config', async () => {
    const owners = [accounts[1], accounts[2]] as const
    const multisig = MultisigConfig.from({
      threshold: 2,
      owners: owners.map((owner) => ({ owner: owner.address, weight: 1 })),
    })
    const multisigAccount = MultisigConfig.getAddress(multisig, {
      factory: nativeMultisigFactory,
    })
    const transaction = {
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      chainId: 1,
      from: multisigAccount,
      multisigSimulation: {
        approvals: owners.map((owner) => ({
          owner: owner.address,
        })),
        config: multisig,
      },
      nonce: 0,
      nonceKey: 1n,
    } as const
    const signatures = await Promise.all(
      owners.map((owner) => owner.signTransaction(transaction)),
    )

    const serialized = await Transaction.serialize({
      ...transaction,
      signatures,
    })
    const { signature } = Transaction.deserialize(serialized as `0x76${string}`)
    expect(signature?.type).toBe('multisig')
    if (signature?.type !== 'multisig') throw new Error('unreachable')
    const {
      account: signatureAccount,
      signatures: approvals,
      ...rest
    } = signature
    expect(signatureAccount).toBeDefined()
    expect(approvals).toHaveLength(2)
    expect(rest).toMatchInlineSnapshot(`
      {
        "config": {
          "owners": [
            {
              "owner": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35d0a019cb0a251ad243a4ccfcf371f46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
          "version": 0n,
        },
        "type": "multisig",
      }
    `)
  })

  test('behavior: signs multisig approvals with config version', async () => {
    const owner = accounts[1]!
    const initialConfig = MultisigConfig.from({
      threshold: 1,
      owners: [{ owner: owner.address, weight: 1 }],
    })
    const account = MultisigConfig.getAddress(initialConfig, {
      factory: nativeMultisigFactory,
    })
    const multisig = MultisigConfig.from({
      ...initialConfig,
      version: 2n,
    })
    const transaction = {
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      chainId: 1,
      from: account,
      multisigSimulation: {
        approvals: [{ owner: owner.address }],
        config: multisig,
      },
      nonce: 1,
    } as const

    const approval = SignatureEnvelope.from(
      await owner.signTransaction(transaction),
    )
    const payload = TxEnvelopeTempo.getSignPayload(
      TxEnvelopeTempo.from({
        calls: transaction.calls,
        chainId: transaction.chainId,
        nonce: BigInt(transaction.nonce),
      }),
    )
    const digest = MultisigConfig.getSignPayload({
      account,
      config: multisig,
      payload,
    })

    expect(
      SignatureEnvelope.extractAddress({
        payload: digest,
        signature: approval,
      }),
    ).toBe(owner.address.toLowerCase())
  })

  test('round-trips funding requirements', async () => {
    const encoded = await Transaction.serialize({
      chainId: 1337,
      calls: [{ to: token }],
      requireFunds: [requirement],
    })
    expect(
      Transaction.deserialize(encoded as Transaction.TransactionSerializedTempo)
        .requireFunds,
    ).toEqual([requirement])
  })

  test('omitted and empty funding preserve legacy bytes', async () => {
    const transaction = { chainId: 1337, calls: [{ to: token }] }
    expect(
      await Transaction.serialize({ ...transaction, requireFunds: [] }),
    ).toBe(await Transaction.serialize(transaction))
  })
})

describe('signTransaction', () => {
  test('behavior: `feePayer` same as sender preserves from', async () => {
    const account = accounts.at(0)!
    const client = getClient()
    const signed = await signTransaction(client, {
      account,
      to: account.address,
      nonce: 0,
      gas: 271000n,
      maxFeePerGas: 20000000000n,
      maxPriorityFeePerGas: 1_000_000_000n,
      feePayer: account,
      type: 'tempo',
    })
    const parsed = Transaction.deserialize(signed as `0x76${string}`)
    expect(parsed.from).toBe(account.address.toLowerCase())
  })
})

describe('formatTransactionRequest', () => {
  test.each([
    Actions.token.transfer.call({
      token,
      amount: 50n,
      to: Addresses.alphaUsd,
      memo: `0x${'00'.repeat(32)}`,
    }),
    Actions.token.burn.call({ token, amount: 50n }),
    Actions.token.burn.call({
      token,
      amount: 50n,
      memo: `0x${'00'.repeat(32)}`,
    }),
    Actions.dex.sell.call({
      tokenIn: token,
      tokenOut: Addresses.alphaUsd,
      amountIn: 50n,
      minAmountOut: 0n,
    }),
  ])('resolves known calldata defaults ($functionName)', (call) => {
    expect(
      Formatters.formatTransactionRequest(
        {
          calls: [call],
          requireFunds: [{ sources: [] }],
        },
        'call',
      ).requireFunds,
    ).toEqual([
      {
        token: expect.stringMatching(
          /^0x20c0000000000000000000000000000000000000$/i,
        ),
        amount: '0x32',
        sources: [],
      },
    ])
  })

  test('does not default amounts for a different funding token', () => {
    for (const call of [
      Actions.token.transfer.call({
        token,
        amount: 50n,
        to: Addresses.alphaUsd,
      }),
      Actions.token.burn.call({ token, amount: 50n }),
      Actions.dex.sell.call({
        tokenIn: token,
        tokenOut: Addresses.alphaUsd,
        amountIn: 50n,
        minAmountOut: 0n,
      }),
    ]) {
      const formatted = Formatters.formatTransactionRequest(
        {
          calls: [call],
          requireFunds: [{ token: Addresses.betaUsd }, { token, sources: [] }],
        },
        'fillTransaction',
      )
      expect(formatted.requireFunds).toEqual([
        { token: Addresses.betaUsd },
        { token, amount: '0x32', sources: [] },
      ])
    }
  })

  test('preserves partial fields for relay resolution', () => {
    const formatted = Formatters.formatTransactionRequest(
      {
        calls: [
          {
            to: '0x9999999999999999999999999999999999999999',
            data: '0x12345678',
          },
        ],
        requireFunds: [{ sources: [] }, { token, amount: 0n }],
      },
      'fillTransaction',
    )
    expect(JSON.parse(JSON.stringify(formatted.requireFunds))).toEqual([
      { sources: [] },
      { token, amount: '0x0' },
    ])
  })

  test.each([0n, 50n])(
    'resolves transfer defaults without a relay (%s)',
    (amount) => {
      const formatted = Formatters.formatTransactionRequest(
        {
          calls: [
            Actions.token.transfer.call({
              token,
              amount,
              to: Addresses.alphaUsd,
            }),
          ],
          requireFunds: [
            { sources: [] },
            { token: Addresses.betaUsd, amount: 0n, sources: [] },
          ],
        },
        'call',
      )
      expect(formatted.requireFunds).toEqual([
        { token, amount: amount === 0n ? '0x0' : '0x32', sources: [] },
        { token: Addresses.betaUsd, amount: '0x0', sources: [] },
      ])
    },
  )

  test('preserves omitted sources for JSON-RPC wallets', () => {
    expect(
      Formatters.formatTransactionRequest(
        { requireFunds: [{ token, amount: 50n }] },
        'sendTransaction',
      ),
    ).toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "data": "0x",
            "to": "0x0000000000000000000000000000000000000000",
            "value": "0x",
          },
        ],
        "data": undefined,
        "requireFunds": [
          {
            "amount": "0x32",
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ],
        "to": undefined,
        "type": "0x76",
        "value": undefined,
      }
    `)
  })

  test.each(['signTransaction'])(
    'rejects unresolved sources for %s',
    (action) => {
      expect(() =>
        Formatters.formatTransactionRequest(
          { requireFunds: [{ token, amount: 50n }] },
          action,
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Resolve omitted funding fields with \`eth_fillTransaction\` before signing.]`,
      )
    },
  )

  test('encodes complete requirements and explicit zero slippage', () => {
    const formatted = Formatters.formatTransactionRequest({
      requireFunds: [requirement],
    })
    expect(formatted.type).toBe('0x76')
    expect(formatted.requireFunds).toEqual([
      FundingRequirement.toRpc(requirement),
    ])
    expect(
      (formatted.requireFunds === true
        ? undefined
        : formatted.requireFunds)?.[0]?.sources?.[0],
    ).toEqual({
      target: Addresses.dexFundingSource,
      data: requirement.sources[0]?.data,
    })
  })

  test('preserves requirements in estimation and simulation', () => {
    for (const action of ['estimateGas', 'call'])
      expect(
        Formatters.formatTransactionRequest(
          { requireFunds: [requirement] },
          action,
        ).requireFunds,
      ).toEqual([FundingRequirement.toRpc(requirement)])
  })
})

describe('behavior', () => {
  test.each(
    ['decoded', 'encoded'].flatMap((type) =>
      [undefined, false, true].map((enforceOrder) => ({ type, enforceOrder })),
    ),
  )(
    'normalizes $type rules with enforceOrder=$enforceOrder before RPC formatting and signing',
    async ({ type, enforceOrder }) => {
      const rules = {
        enforceOrder,
        maxSlippageBps: 100,
        sources: { [token]: [FundingSource.dex({ tokenIn: token })] },
      }
      const encoded = FundingPolicy.encode(rules)
      const input = {
        ...requirement,
        policyRules: type === 'decoded' ? rules : encoded,
      }
      const expected = { ...requirement, policyRules: encoded }
      for (const action of [undefined, 'estimateGas', 'call']) {
        expect(
          Formatters.formatTransactionRequest({ requireFunds: [input] }, action)
            .requireFunds,
        ).toEqual([FundingRequirement.toRpc(expected)])
      }
      const transaction = { chainId: 1337, calls: [{ to: token }] }
      expect(
        await Transaction.serialize({ ...transaction, requireFunds: [input] }),
      ).toBe(
        await Transaction.serialize({
          ...transaction,
          requireFunds: [expected],
        }),
      )
      expect(input).toHaveProperty('policyRules')
      expect(input).not.toHaveProperty('rules')
    },
  )
})

test('formats automatic requirements before relay resolution', () => {
  for (const action of [
    'fillTransaction',
    'sendTransaction',
    'estimateGas',
    'call',
  ])
    expect(
      Formatters.formatTransactionRequest({ requireFunds: true }, action)
        .requireFunds,
    ).toBe(true)
  for (const action of ['signTransaction'])
    expect(() =>
      Formatters.formatTransactionRequest({ requireFunds: true }, action),
    ).toThrow('before signing')
})
