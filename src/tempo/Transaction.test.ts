import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import { prepareTransactionRequest, signTransaction } from '../actions/index.js'
import * as Transaction from './Transaction.js'

const client = getClient({
  account: accounts.at(0)!,
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

  test('behavior: tempo transaction with `from`', async () => {
    const request = await prepareTransactionRequest(client, {
      to: '0x0000000000000000000000000000000000000000',
      feePayer: true,
    })
    const serialized = await signTransaction(client, request)
    const deserialized = Transaction.deserialize(serialized)
    expect(deserialized.type).toBe('tempo')
    expect((deserialized as { from?: string }).from).toBeDefined()
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

  test('behavior: serializes with feePayer: true and signature adds from marker', async () => {
    const serialized = await Transaction.serialize(
      {
        chainId: 1,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        feePayer: true,
        from: accounts.at(0)!.address,
      },
      { type: 'secp256k1', signature: { r: 1n, s: 1n, yParity: 0 } },
    )
    expect(serialized.endsWith('feefeefeefee')).toBe(true)
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

  test('behavior: throws when feePayer object but no from and non-secp256k1 sig', async () => {
    await expect(
      Transaction.serialize(
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
      ),
    ).rejects.toThrow('Unable to extract sender from transaction or signature.')
  })
})
