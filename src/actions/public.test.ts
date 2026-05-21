import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../test/anvil.js'
import * as anvil from '../../test/anvil.js'

const address = '0x0000000000000000000000000000000000000001'
const code = '0x6001600055'
const slot = '0x0'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('public', () => {
  test('behavior: exposes action functions', () => {
    expect({
      createBlockFilter: typeof actions.createBlockFilter,
      createEventFilter: typeof actions.createEventFilter,
      createPendingTransactionFilter:
        typeof actions.createPendingTransactionFilter,
      getBalance: typeof actions.getBalance,
      getBlobBaseFee: typeof actions.getBlobBaseFee,
      getBlock: typeof actions.getBlock,
      getBlockNumber: typeof actions.getBlockNumber,
      getBlockTransactionCount: typeof actions.getBlockTransactionCount,
      getChainId: typeof actions.getChainId,
      getCode: typeof actions.getCode,
      getDelegation: typeof actions.getDelegation,
      getFeeHistory: typeof actions.getFeeHistory,
      getFilterChanges: typeof actions.getFilterChanges,
      getFilterLogs: typeof actions.getFilterLogs,
      getGasPrice: typeof actions.getGasPrice,
      getLogs: typeof actions.getLogs,
      getProof: typeof actions.getProof,
      getStorageAt: typeof actions.getStorageAt,
      getTransaction: typeof actions.getTransaction,
      getTransactionConfirmations: typeof actions.getTransactionConfirmations,
      getTransactionCount: typeof actions.getTransactionCount,
      getTransactionReceipt: typeof actions.getTransactionReceipt,
      publicActions: typeof actions.publicActions,
      uninstallFilter: typeof actions.uninstallFilter,
    }).toMatchInlineSnapshot(`
      {
        "createBlockFilter": "function",
        "createEventFilter": "function",
        "createPendingTransactionFilter": "function",
        "getBalance": "function",
        "getBlobBaseFee": "function",
        "getBlock": "function",
        "getBlockNumber": "function",
        "getBlockTransactionCount": "function",
        "getChainId": "function",
        "getCode": "function",
        "getDelegation": "function",
        "getFeeHistory": "function",
        "getFilterChanges": "function",
        "getFilterLogs": "function",
        "getGasPrice": "function",
        "getLogs": "function",
        "getProof": "function",
        "getStorageAt": "function",
        "getTransaction": "function",
        "getTransactionConfirmations": "function",
        "getTransactionCount": "function",
        "getTransactionReceipt": "function",
        "publicActions": "function",
        "uninstallFilter": "function",
      }
    `)
  })

  test('behavior: decorates clients with public actions', async () => {
    const client = anvil
      .getClient(anvilMainnet)
      .extend(actions.publicActions())
      .extend(actions.testActions())

    await client.test.setBalance({ address, value: 42n })
    await client.test.setCode({ address, bytecode: code })
    await client.test.setNonce({ address, nonce: 42n })
    await client.test.setStorageAt({ address, slot, value })

    await expect(client.public.getChainId()).resolves.toMatchInlineSnapshot(
      `31337n`,
    )
    const block = await client.public.getBlock()
    const blockNumber = await client.public.getBlockNumber()
    const blockTransactionCount = await client.public.getBlockTransactionCount()
    const gasPrice = await client.public.getGasPrice()
    const blobBaseFee = await client.public.getBlobBaseFee()

    expect({
      balance: await client.public.getBalance({ address }),
      blobBaseFee: typeof blobBaseFee,
      block: typeof block.hash,
      blockNumber: typeof blockNumber,
      blockTransactionCount: typeof blockTransactionCount,
      code: await client.public.getCode({ address }),
      gasPrice: typeof gasPrice,
      storage: await client.public.getStorageAt({ address, slot }),
      transactionCount: await client.public.getTransactionCount({ address }),
    }).toMatchInlineSnapshot(`
      {
        "balance": 42n,
        "blobBaseFee": "bigint",
        "block": "string",
        "blockNumber": "bigint",
        "blockTransactionCount": "bigint",
        "code": "0x6001600055",
        "gasPrice": "bigint",
        "storage": "0x000000000000000000000000000000000000000000000000000000000000002a",
        "transactionCount": 42n,
      }
    `)
  })

  test('behavior: decorates transaction read methods', async () => {
    const client = anvil
      .getClient(anvilMainnet)
      .extend(actions.publicActions())
      .extend(actions.testActions())

    // Wallet actions (`eth_accounts`, `eth_sendTransaction`) aren't wired up
    // yet; fall through to the client's RPC layer until `actions.wallet` lands.
    const [from, to] = await client.request({ method: 'eth_accounts' })
    const hash = await client.request({
      method: 'eth_sendTransaction',
      params: [{ from, gas: '0x5208', to, value: '0x1' }],
    })
    await client.test.mine({ blocks: 1n })

    const transaction = await client.public.getTransaction({ hash })
    const receipt = await client.public.getTransactionReceipt({ hash })
    const confirmations = await client.public.getTransactionConfirmations({
      hash,
    })

    expect({
      hash: transaction.hash,
      receiptStatus: receipt.status,
      confirmations: confirmations >= 1n,
    }).toMatchObject({
      hash,
      receiptStatus: 'success',
      confirmations: true,
    })
  })
})
