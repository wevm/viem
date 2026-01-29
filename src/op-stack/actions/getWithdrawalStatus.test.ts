import { beforeAll, describe, expect, test, vi } from 'vitest'
import { anvilMainnet, anvilOptimism } from '../../../test/src/anvil.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import { getWithdrawalStatus } from './getWithdrawalStatus.js'

const client = anvilMainnet.getClient()
const optimismClient = anvilOptimism.getClient()

test('waiting-to-prove', async () => {
  await reset(client, {
    blockNumber: 19868020n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
  await reset(optimismClient, {
    blockNumber: 131027672n,
    jsonRpcUrl: anvilOptimism.forkUrl,
  })

  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0xb3cd0bf131e97b0339b6abde0aa7636fc87114ec6ff8cec28b5002c851c929a3',
  })

  const status = await getWithdrawalStatus(client, {
    gameLimit: 10,
    receipt,
    targetChain: optimismClient.chain,
  })
  expect(status).toBe('waiting-to-prove')
})

test('ready-to-prove', async () => {
  await reset(client, {
    blockNumber: 19868020n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
  await reset(optimismClient, {
    blockNumber: 131027872n,
    jsonRpcUrl: anvilOptimism.forkUrl,
  })

  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0xb3cd0bf131e97b0339b6abde0aa7636fc87114ec6ff8cec28b5002c851c929a3',
  })

  const status = await getWithdrawalStatus(client, {
    gameLimit: 10,
    receipt,
    targetChain: optimismClient.chain,
  })
  expect(status).toBe('waiting-to-prove')
})

test('waiting-to-finalize', async () => {
  await reset(client, {
    blockNumber: 21890132n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

  const status = await getWithdrawalStatus(client, {
    gameLimit: 10,
    targetChain: optimismClient.chain,
    l2BlockNumber: 21890440n,
    withdrawalHash:
      '0x93439E023E5C21BAE8A4291990C4C17C7AC91B6602E92612C61B0A6FE14682E2',
    sender: '0xf919B7DF8eBAD99B9Bb0Af9e40E9255E54343EF8',
  })
  expect(status).toBe('waiting-to-finalize')
})

test('ready-to-finalize', async () => {
  await reset(client, {
    blockNumber: 21890438n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

  const status = await getWithdrawalStatus(client, {
    gameLimit: 10,
    targetChain: optimismClient.chain,
    l2BlockNumber: 21890440n,
    withdrawalHash:
      '0x1CD56A12D477EDB091DDECAC56A29D51AD61A9920BE8FCF1EE62BA00AF2B8E55',
    sender: '0x7F6a4DfFcE8aE3AD8b75a35b6e2FB611b93Ca1DB',
  })
  expect(status).toBe('ready-to-finalize')
})

test('finalized', async () => {
  await reset(client, {
    blockNumber: 21890440n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

  const status = await getWithdrawalStatus(client, {
    gameLimit: 10,
    targetChain: optimismClient.chain,
    l2BlockNumber: 21890440n,
    withdrawalHash:
      '0x1CD56A12D477EDB091DDECAC56A29D51AD61A9920BE8FCF1EE62BA00AF2B8E55',
    sender: '0x7F6a4DfFcE8aE3AD8b75a35b6e2FB611b93Ca1DB',
  })
  expect(status).toBe('finalized')
})

test('error: non-withdrawal tx', async () => {
  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0xecb1c13ee638e5cf6a0977d9ee6910fb7c5188d3dff807fd3e658d1533137023',
  })

  await expect(() =>
    getWithdrawalStatus(client, {
      receipt,
      targetChain: optimismClient.chain,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ReceiptContainsNoWithdrawalsError: The provided transaction receipt with hash "0xecb1c13ee638e5cf6a0977d9ee6910fb7c5188d3dff807fd3e658d1533137023" contains no withdrawals.

    Version: viem@x.y.z]
  `)
})

test('error: portal contract non-existent (old block)', async () => {
  await reset(client, {
    blockNumber: 15772363n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
  })

  await expect(() =>
    getWithdrawalStatus(client, {
      receipt,
      targetChain: optimismClient.chain,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "version" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "version",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  version()

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `)
})

describe('legacy (portal v2)', () => {
  beforeAll(async () => {
    await reset(client, {
      blockNumber: 18772363n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
  })

  test('ready-to-prove', async () => {
    // https://optimistic.etherscan.io/tx/0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
    })

    const status = await getWithdrawalStatus(client, {
      receipt,
      targetChain: optimismClient.chain,
    })
    expect(status).toBe('ready-to-prove')
  }, 20_000)

  test('waiting-to-prove', async () => {
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
    })

    const status = await getWithdrawalStatus(client, {
      receipt: {
        ...receipt,
        blockNumber: 99999999999999n,
      },
      targetChain: optimismClient.chain,
    })
    expect(status).toBe('waiting-to-prove')
  })

  test('waiting-to-finalize', async () => {
    await reset(client, {
      blockNumber: 18804700n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
    vi.setSystemTime(new Date(1702805347000))

    // https://etherscan.io/tx/0x281675c625ee73af6f83ae0c760c87efd312a71f406922ac9e4e467b1bf5a8bb
    // https://optimistic.etherscan.io/tx/0x8f6cb1878adad369d6fc8f6cd4f8cd0ea17d3a76e58947b93bc41ab65717da18
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x8f6cb1878adad369d6fc8f6cd4f8cd0ea17d3a76e58947b93bc41ab65717da18',
    })

    const status = await getWithdrawalStatus(client, {
      receipt,
      targetChain: optimismClient.chain,
    })
    expect(status).toBe('waiting-to-finalize')

    vi.useRealTimers()
  }, 20_000)

  test('ready-to-finalize', async () => {
    await reset(client, {
      blockNumber: 18803790n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
    // https://etherscan.io/tx/0xec7d0380be9c64daf725369fc3bb6ebe2b0b5ed01291661130f6322696d9f1d7
    // https://optimistic.etherscan.io/tx/0x80c06f76d42e94a6427672e99e83bc487fde29570d1cf59844cad2d43fdf2ab4
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x80c06f76d42e94a6427672e99e83bc487fde29570d1cf59844cad2d43fdf2ab4',
    })

    const status = await getWithdrawalStatus(client, {
      receipt,
      targetChain: optimismClient.chain,
    })
    expect(status).toBe('ready-to-finalize')
  }, 20_000)
})
