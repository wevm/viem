import {
  deployContract,
  getBalance,
  getTransactionCount,
  readContract,
  sendTransactionSync,
  waitForTransactionReceipt,
} from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { wagmiContractConfig } from '~test/abis.js'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0] })

describe('calls', () => {
  test('executes independent atomic call groups', async () => {
    const balance = await getBalance(client, { address: accounts[1].address })
    const receipt = await sendTransactionSync(client, {
      frames: [
        Frame.calls([
          { to: accounts[1].address, value: 1n },
          { to: accounts[1].address, value: 2n },
        ]),
        Frame.calls([{ to: accounts[1].address, value: 4n }]),
      ],
    })
    expect(receipt.status).toBe('success')
    expect(receipt.frameReceipts).toHaveLength(4)
    expect(await getBalance(client, { address: accounts[1].address })).toBe(
      balance + 7n,
    )
  })

  test('rolls back a failed group and continues with the next group', async () => {
    const balance = await getBalance(client, { address: accounts[1].address })
    const gas = { executionGas: 50_000n, stateGas: 0n }
    const receipt = await sendTransactionSync(client, {
      maxFeePerGas: 10_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
      nonce: await getTransactionCount(client, {
        address: accounts[0].address,
      }),
      frames: [
        Frame.verify({ account: accounts[0], ...gas }),
        Frame.calls([
          { ...gas, to: accounts[1].address, value: 1n },
          {
            ...gas,
            to: '0x0000000000000000000000000000000000008141',
            data: '0x0000000000000000',
          },
          { ...gas, to: accounts[1].address, value: 2n },
        ]),
        Frame.calls([
          { ...gas, to: accounts[1].address, value: 4n },
          { ...gas, to: accounts[1].address, value: 8n },
        ]),
      ],
      throwOnReceiptRevert: false,
    })
    expect(await getBalance(client, { address: accounts[1].address })).toBe(
      balance + 12n,
    )
    expect(receipt.frameReceipts?.map(({ status }) => status)).toEqual([
      'success',
      'success',
      'reverted',
      'skipped',
      'success',
      'success',
    ])
    expect(receipt.frameReceipts?.[1]?.logs).toEqual([])
  })

  test('executes ABI-inferred contract calls mixed with raw calls', async () => {
    const { abi, bytecode } = wagmiContractConfig
    const hash = await deployContract(client, { abi, bytecode })
    const deployment = await waitForTransactionReceipt(client, { hash })
    const to = deployment.contractAddress!
    const balance = await getBalance(client, { address: accounts[1].address })

    const receipt = await sendTransactionSync(client, {
      frames: [
        Frame.calls([
          { to, abi, functionName: 'mint', args: [42n] },
          {
            to,
            abi,
            functionName: 'transferFrom',
            args: [accounts[0].address, accounts[1].address, 42n],
          },
          { to: accounts[1].address, value: 1n },
        ]),
      ],
    })

    expect(receipt.status).toBe('success')
    expect(receipt.frameReceipts?.map(({ status }) => status)).toEqual([
      'success',
      'success',
      'success',
      'success',
    ])
    expect(
      await readContract(client, {
        address: to,
        abi,
        functionName: 'ownerOf',
        args: [42n],
      }),
    ).toBe(accounts[1].address)
    expect(await getBalance(client, { address: accounts[1].address })).toBe(
      balance + 1n,
    )
  })
})
