import { createWalletClient, http } from 'viem'
import { sendTransaction, sendTransactionSync } from 'viem/actions'
import { describe, expect, test } from 'vitest'

const client = createWalletClient({
  account: '0x0000000000000000000000000000000000000001',
  transport: http('http://127.0.0.1:1', { retryCount: 0 }),
})

describe('frame rpc requests', () => {
  test.each([sendTransaction, sendTransactionSync])(
    'applies client suffixes to explicit sender frames',
    async (send) => {
      await expect(
        send(
          { ...client, dataSuffix: '0xbeef' },
          {
            chain: null,
            frames: [
              {
                mode: 'verify',
                flags: 'approveExecutionAndPayment',
                data: '0x12',
              },
              { mode: 'sender', data: '0x34' },
            ],
            signatures: [{ scheme: 'secp256k1' }],
          },
        ),
      ).rejects.toThrow('"data":"0x34beef"')
    },
  )

  test.each([sendTransaction, sendTransactionSync])(
    'preserves blob hashes in failed RPC requests',
    async (send) => {
      const hash = `0x01${'00'.repeat(31)}` as const
      await expect(
        send(client, {
          chain: null,
          frames: [{ mode: 'verify', flags: 'approveExecutionAndPayment' }],
          signatures: [{ scheme: 'secp256k1' }],
          blobVersionedHashes: [hash],
        }),
      ).rejects.toThrow(`"blobVersionedHashes":["${hash}"]`)
    },
  )
})
