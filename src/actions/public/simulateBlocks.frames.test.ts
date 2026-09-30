import { http } from 'viem'
import { simulateBlocks } from 'viem/actions'
import { Frame } from 'viem/frames'
import { Actions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'
import { rpcUrl } from '~test/frames/prool.js'
import * as FrameTransaction from '../../frames/internal/transaction.js'

describe('frames: Frame', () => {
  test.each(['core', 'tempo'] as const)(
    'simulation placeholders: %s',
    async (action) => {
      const witnesses: unknown[] = []
      const client = getClient({
        account: accounts[0].address,
        transport: http(rpcUrl, {
          retryCount: 0,
          async onFetchRequest(request) {
            const body = await request.clone().json()
            if (
              body.method === 'eth_simulateV1' ||
              body.method === 'tempo_simulateV1'
            )
              witnesses.push(
                body.params[0].blockStateCalls[0].calls[0].signatures[1]
                  .signature,
              )
          },
        }),
      })
      const prepared = FrameTransaction.resolve({
        to: undefined,
        account: accounts[0].address,
        maxFeePerBlobGas: 0n,
        blobVersionedHashes: [],
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

      // Check the RPC boundary: Reth rejects unsigned EOA verification and lacks Tempo simulation.
      if (action === 'core')
        await expect(
          simulateBlocks(client, { blocks: [{ calls: [prepared] }] }),
        ).rejects.toThrow('EIP-8141 signature validation failed')
      else
        await expect(
          Actions.simulate.simulateBlocks(client, {
            blocks: [{ calls: [prepared] }],
          }),
        ).rejects.toThrow('Method not found')

      expect(witnesses).toMatchInlineSnapshot(`
      [
        "0xaabb",
      ]
    `)
      expect(prepared.signatures![1]!.signature).toMatchInlineSnapshot('"0x"')
    },
  )
})
