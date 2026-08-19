import { describe, expect, test, vi } from 'vitest'

import { signTransactionForSend } from './signTransactionForSend.js'

describe('signTransactionForSend', () => {
  test('wraps a primitive approval that starts with fee payer magic', async () => {
    const approval = `0x78${'11'.repeat(64)}` as const
    const serializer = vi.fn().mockResolvedValue('0x76wrapped')
    const account = {
      signTransaction: vi.fn().mockResolvedValue(approval),
    }

    const serialized = await signTransactionForSend(
      account as never,
      { multisig: '0x0000000000000000000000000000000000000001' } as never,
      serializer,
    )

    expect({
      serialized,
      signatures: serializer.mock.calls[0]?.[0].signatures,
    }).toMatchInlineSnapshot(`
        {
          "serialized": "0x76wrapped",
          "signatures": [
            "${approval}",
          ],
        }
      `)
  })

  test('wraps a primitive approval that starts with transaction magic', async () => {
    const approval = `0x76${'11'.repeat(64)}` as const
    const serializer = vi.fn().mockResolvedValue('0x76wrapped')
    const account = {
      signTransaction: vi.fn().mockResolvedValue(approval),
    }

    const serialized = await signTransactionForSend(
      account as never,
      { multisig: '0x0000000000000000000000000000000000000001' } as never,
      serializer,
    )

    expect({
      serialized,
      signatures: serializer.mock.calls[0]?.[0].signatures,
    }).toMatchInlineSnapshot(`
        {
          "serialized": "0x76wrapped",
          "signatures": [
            "${approval}",
          ],
        }
      `)
  })

  test('preserves a fee payer envelope', async () => {
    const envelope =
      '0x78f83901808080d8d79470997970c51812dc3a010c7d01b50e0d17dc79c88080c0808080808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266c0'
    const serializer = vi.fn()
    const account = {
      signTransaction: vi.fn().mockResolvedValue(envelope),
    }

    const serialized = await signTransactionForSend(
      account as never,
      { multisig: '0x0000000000000000000000000000000000000001' } as never,
      serializer,
    )

    expect({
      serialized,
      serializerCalls: serializer.mock.calls.length,
    }).toMatchInlineSnapshot(`
        {
          "serialized": "${envelope}",
          "serializerCalls": 0,
        }
      `)
  })

  test('preserves a Tempo transaction envelope', async () => {
    const envelope =
      '0x76f84101808080f4d79470997970c51812dc3a010c7d01b50e0d17dc79c88080db943c44cdddb6a900fa2b585dd299e03d12fa4293bc8207d0821234c0808080808080c0'
    const serializer = vi.fn()
    const account = {
      signTransaction: vi.fn().mockResolvedValue(envelope),
    }

    const serialized = await signTransactionForSend(
      account as never,
      { multisig: '0x0000000000000000000000000000000000000001' } as never,
      serializer,
    )

    expect({
      serialized,
      serializerCalls: serializer.mock.calls.length,
    }).toMatchInlineSnapshot(`
        {
          "serialized": "${envelope}",
          "serializerCalls": 0,
        }
      `)
  })
})
