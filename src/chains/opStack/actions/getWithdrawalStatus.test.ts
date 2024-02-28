import { beforeAll, describe, expect, test, vi } from 'vitest'
import { optimismClient } from '../../../../test/src/opStack.js'
import { createL1Server } from '../../../../test/src/opStack.js'
import { publicClient, setBlockNumber } from '../../../../test/src/utils.js'
import { getTransactionReceipt } from '../../../actions/index.js'
import { getWithdrawalStatus } from './getWithdrawalStatus.js'

describe('getWithdrawalStatusV3', () => {
  // let publicClient: Awaited<ReturnType<typeof createL1Server>>['publicClient']
  // let testClient: Awaited<ReturnType<typeof createL1Server>>['testClient']

  beforeAll(async () => {
    const res = await createL1Server()
    // publicClient = res.publicClient
    // testClient = res.testClient
    return res.server.close
  })

  test('finalized', async () => {}, 20_000)
  test('ready-to-prove', async () => {}, 20_000)

  test('waiting-to-prove', async () => {})

  test('waiting-to-finalize', async () => {}, 20_000)

  test('ready-to-finalize', async () => {}, 20_000)
})

describe('getWithdrawalStatusV2', () => {
  beforeAll(async () => {
    await setBlockNumber(18772363n)
  })

  test('ready-to-prove', async () => {
    // https://optimistic.etherscan.io/tx/0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
    })

    const status = await getWithdrawalStatus(publicClient, {
      receipt,
      targetChain: optimismClient.chain,
    })
    expect(status).toBe('ready-to-prove')
  }, 20_000)

  test('waiting-to-prove', async () => {
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
    })

    const status = await getWithdrawalStatus(publicClient, {
      receipt: {
        ...receipt,
        blockNumber: 99999999999999n,
      },
      targetChain: optimismClient.chain,
    })
    expect(status).toBe('waiting-to-prove')
  })

  test('waiting-to-finalize', async () => {
    await setBlockNumber(18804700n)
    vi.setSystemTime(new Date(1702805347000))

    // https://etherscan.io/tx/0x281675c625ee73af6f83ae0c760c87efd312a71f406922ac9e4e467b1bf5a8bb
    // https://optimistic.etherscan.io/tx/0x8f6cb1878adad369d6fc8f6cd4f8cd0ea17d3a76e58947b93bc41ab65717da18
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x8f6cb1878adad369d6fc8f6cd4f8cd0ea17d3a76e58947b93bc41ab65717da18',
    })

    const status = await getWithdrawalStatus(publicClient, {
      receipt,
      targetChain: optimismClient.chain,
    })
    expect(status).toBe('waiting-to-finalize')

    vi.useRealTimers()
  }, 20_000)

  test('ready-to-finalize', async () => {
    await setBlockNumber(18803790n)
    // https://etherscan.io/tx/0xec7d0380be9c64daf725369fc3bb6ebe2b0b5ed01291661130f6322696d9f1d7
    // https://optimistic.etherscan.io/tx/0x80c06f76d42e94a6427672e99e83bc487fde29570d1cf59844cad2d43fdf2ab4
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x80c06f76d42e94a6427672e99e83bc487fde29570d1cf59844cad2d43fdf2ab4',
    })

    const status = await getWithdrawalStatus(publicClient, {
      receipt,
      targetChain: optimismClient.chain,
    })
    expect(status).toBe('ready-to-finalize')
  }, 20_000)

  test('error: non-withdrawal tx', async () => {
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0xecb1c13ee638e5cf6a0977d9ee6910fb7c5188d3dff807fd3e658d1533137023',
    })

    await expect(() =>
      getWithdrawalStatus(publicClient, {
        receipt,
        targetChain: optimismClient.chain,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ReceiptContainsNoWithdrawalsError: The provided transaction receipt with hash "0xecb1c13ee638e5cf6a0977d9ee6910fb7c5188d3dff807fd3e658d1533137023" contains no withdrawals.

    Version: viem@1.0.2]
  `)
  })

  test('error: portal contract non-existent (old block)', async () => {
    await setBlockNumber(15772363n)
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
    })

    await expect(() =>
      getWithdrawalStatus(publicClient, {
        receipt,
        targetChain: optimismClient.chain,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "getL2OutputIndexAfter" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "getL2OutputIndexAfter",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  getL2OutputIndexAfter(uint256 _l2BlockNumber)
      args:                           (113388533)

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@1.0.2]
  `)
  })
})
