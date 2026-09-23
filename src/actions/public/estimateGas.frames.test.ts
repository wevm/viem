import * as Secp256k1 from 'ox/Secp256k1'
import * as TxEnvelopeEip8141 from 'ox/TxEnvelopeEip8141'
import type { TransactionSerializableEIP8141 } from 'viem'
import { estimateGas, getBalance, getTransactionCount } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts as constants } from '~test/constants.js'
import { accounts, chain, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  // TODO: remove once migrated to reth or anvil. Nethermind requires signatures during unsigned simulation.
  await expect(
    estimateGas(client, {
      frames: [
        { flags: 'approveExecutionAndPayment', gas: 50_000n, mode: 'verify' },
      ],
      // TODO: remove once migrated to reth or anvil. Nethermind simulation requires an outer recipient.
      to: accounts[0].address,
    }),
  ).rejects.toThrow('VERIFY frame reverted')
})

test('args: signatures', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })
  const nonce = await getTransactionCount(client, {
    address: accounts[0].address,
  })
  const transaction = {
    chainId: chain.id,
    frames: [
      { flags: 'approveExecutionAndPayment', gas: 50_000n, mode: 'verify' },
      { gas: 50_000n, mode: 'sender', to: accounts[1].address, value: 1n },
      {
        data: '0xdeadbeef',
        gas: 50_000n,
        mode: 'sender',
        to: '0x0000000000000000000000000000000000000004',
      },
    ],
    maxFeePerGas: 10_000_000_000n,
    maxPriorityFeePerGas: 1_000_000_000n,
    nonce,
    sender: accounts[0].address,
    signatures: [{ scheme: 'secp256k1' }],
  } satisfies TransactionSerializableEIP8141
  const signature = Secp256k1.sign({
    payload: TxEnvelopeEip8141.getSignPayload({
      ...transaction,
      nonce: BigInt(nonce),
    }),
    privateKey: constants[0].privateKey,
  })
  const { sender, ...request } = transaction
  const parameters = {
    ...request,
    account: sender,
    signatures: [{ scheme: 'secp256k1', signature }],
    // TODO: remove once migrated to reth or anvil. Nethermind simulation requires an outer recipient.
    to: sender,
  } as const
  expect(await estimateGas(client, parameters)).toMatchInlineSnapshot(`173329n`)
  await expect(
    estimateGas(client, {
      ...parameters,
      frames: [{ gas: 50_000n, mode: 255 }],
    }),
  ).rejects.toThrow('frame mode must be DEFAULT, VERIFY, SENDER, or POST_TX')
  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance,
  )
  expect(
    await getTransactionCount(client, { address: accounts[0].address }),
  ).toBe(nonce)
})
