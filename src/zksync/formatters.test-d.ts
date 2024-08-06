import { describe, expectTypeOf, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import { getBlock } from '../actions/public/getBlock.js'
import { getTransaction } from '../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../actions/public/getTransactionReceipt.js'
import { prepareTransactionRequest } from '../actions/wallet/prepareTransactionRequest.js'
import { sendTransaction } from '../actions/wallet/sendTransaction.js'
import { signTransaction } from '../actions/wallet/signTransaction.js'
import { zksync } from '../chains/index.js'
import { createPublicClient } from '../clients/createPublicClient.js'
import { createWalletClient } from '../clients/createWalletClient.js'
import { http } from '../clients/transports/http.js'
import type { Log } from '../types/log.js'
import type { Hash } from '../types/misc.js'
import { formatters } from './formatters.js'
import type { ZksyncRpcBlock } from './types/block.js'
import type { ZksyncEip712Meta } from './types/eip712.js'
import type { ZksyncL2ToL1Log, ZksyncLog } from './types/log.js'
import type {
  ZksyncRpcTransactionReceipt,
  ZksyncTransactionRequest,
} from './types/transaction.js'

describe('block', () => {
  expectTypeOf(formatters.block.format)
    .parameter(0)
    .toEqualTypeOf<ZksyncRpcBlock>()
  expectTypeOf<ReturnType<typeof formatters.block.format>['l1BatchNumber']>()
    .toEqualTypeOf<bigint | null>
  expectTypeOf<ReturnType<typeof formatters.block.format>['l1BatchTimestamp']>()
    .toEqualTypeOf<bigint | null>
})

describe('transactionReceipt', () => {
  expectTypeOf(formatters.transactionReceipt.format)
    .parameter(0)
    .toEqualTypeOf<ZksyncRpcTransactionReceipt>()

  expectTypeOf<
    ReturnType<typeof formatters.transactionReceipt.format>['l1BatchNumber']
  >().toEqualTypeOf<bigint | null>()
  expectTypeOf<
    ReturnType<typeof formatters.transactionReceipt.format>['l1BatchTxIndex']
  >().toEqualTypeOf<bigint | null>()
  expectTypeOf<
    ReturnType<typeof formatters.transactionReceipt.format>['l2ToL1Logs']
  >().toEqualTypeOf<
    {
      blockNumber: bigint
      blockHash: string
      l1BatchNumber: bigint
      transactionIndex: bigint
      shardId: bigint
      isService: boolean
      sender: string
      key: string
      value: string
      transactionHash: string
      logIndex: bigint
    }[]
  >()

  expectTypeOf<
    ReturnType<typeof formatters.transactionReceipt.format>['logs']
  >().toEqualTypeOf<
    (Log<
      bigint,
      number,
      boolean,
      undefined,
      undefined,
      undefined,
      undefined
    > & {
      l1BatchNumber: bigint | null
      transactionLogIndex: number
      logType: `0x${string}` | null
    })[]
  >()

  expectTypeOf<
    ReturnType<
      typeof formatters.transactionReceipt.format
    >['logs'][0]['l1BatchNumber']
  >().toEqualTypeOf<bigint | null>()
  expectTypeOf<
    ReturnType<
      typeof formatters.transactionReceipt.format
    >['logs'][0]['transactionLogIndex']
  >().toEqualTypeOf<number>()
  expectTypeOf<
    ReturnType<
      typeof formatters.transactionReceipt.format
    >['logs'][0]['logType']
  >().toEqualTypeOf<`0x${string}` | null>()
})

describe('transactionRequest', () => {
  expectTypeOf(formatters.transactionRequest.format)
    .parameter(0)
    .toEqualTypeOf<ZksyncTransactionRequest>()
  expectTypeOf<
    ReturnType<typeof formatters.transactionRequest.format>['eip712Meta']
  >().toEqualTypeOf<ZksyncEip712Meta | undefined>()
})

describe('smoke', () => {
  test('block', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })
    const block = await getBlock(client, {
      blockNumber: 35533n,
    })

    expectTypeOf(block.transactions).toEqualTypeOf<Hash[]>()
  })

  test('transaction', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 16280770n,
      index: 0,
    })

    expectTypeOf(transaction.type).toEqualTypeOf<
      | 'legacy'
      | 'eip2930'
      | 'eip1559'
      | 'eip4844'
      | 'eip7702'
      | 'eip712'
      | 'priority'
    >()
  })

  test('transactionReceipt', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })

    const transaction = await getTransactionReceipt(client, {
      hash: '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
    })

    expectTypeOf(transaction.l1BatchTxIndex).toEqualTypeOf<bigint | null>()
    expectTypeOf(transaction.l1BatchNumber).toEqualTypeOf<bigint | null>()
    expectTypeOf(transaction.l2ToL1Logs).toEqualTypeOf<ZksyncL2ToL1Log[]>()
    expectTypeOf(transaction.logs).toEqualTypeOf<ZksyncLog[]>()
  })

  test('transactionRequest (prepareTransactionRequest)', async () => {
    const client = createWalletClient({
      account: privateKeyToAccount(accounts[0].privateKey),
      chain: zksync,
      transport: http(),
    })

    prepareTransactionRequest(client, {
      to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
      data: '0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000094869204461766964340000000000000000000000000000000000000000000000',
      gasPerPubdata: 50000n,
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
    })
  })

  test('transactionRequest (sendTransaction)', async () => {
    const client = createWalletClient({
      account: privateKeyToAccount(accounts[0].privateKey),
      chain: zksync,
      transport: http(),
    })

    sendTransaction(client, {
      to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
      maxFeePerGas: 0n,
      gasPerPubdata: 50000n,
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
    })
  })

  test('transactionRequest (signTransaction)', async () => {
    const client = createWalletClient({
      account: privateKeyToAccount(accounts[0].privateKey),
      chain: zksync,
      transport: http(),
    })

    signTransaction(client, {
      gasPerPubdata: 50000n,
      maxFeePerGas: 250000000n,
      maxPriorityFeePerGas: 0n,
      to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
      data: '0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000094869204461766964340000000000000000000000000000000000000000000000',
      paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      customSignature: '0x1',
      type: 'eip712',
    })
  })
})
