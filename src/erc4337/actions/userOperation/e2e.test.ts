import { AbiEvent, Address, type Hex, Value } from 'ox'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { Actions as CoreActions } from 'viem'
import { Actions, BundlerClient, PaymasterClient, http } from 'viem/erc4337'
import {
  createVerifyingPaymasterServer,
  deployVerifyingPaymaster07,
  getSmartAccounts_06,
  getSmartAccounts_07,
  getSmartAccounts_08,
  getSmartAccounts_09,
} from '~test/account-abstraction.js'
import * as anvil from '~test/anvil.js'
import { bundler, bundler09, prepareEntryPoint09 } from '~test/bundler.js'
import * as constants from '~test/constants.js'

const executionClient = anvil.getClient(anvil.mainnet)
const bundlerControlClient = BundlerClient.create({
  transport: http(bundler.rpcUrl.http),
})
const bundler09ControlClient = BundlerClient.create({
  transport: http(bundler09.rpcUrl.http),
})
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test
const fees = {
  maxFeePerGas: Value.fromGwei('15'),
  maxPriorityFeePerGas: Value.fromGwei('2'),
} as const

function getIncludedTransactionHash(operation: {
  transactionHash: Hex.Hex | null
}) {
  if (!operation.transactionHash)
    throw new Error('Included User Operation has no transaction hash.')
  return operation.transactionHash
}

let account06: Awaited<ReturnType<typeof getSmartAccounts_06>>[number]
let account07: Awaited<ReturnType<typeof getSmartAccounts_07>>[number]
let sponsoredAccount07: Awaited<ReturnType<typeof getSmartAccounts_07>>[number]
let account08: Awaited<ReturnType<typeof getSmartAccounts_08>>[number]
let account09: Awaited<ReturnType<typeof getSmartAccounts_09>>[number]
let paymaster: Address.Address
let paymasterServer: Awaited<ReturnType<typeof createVerifyingPaymasterServer>>

beforeAll(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return

  await prepareEntryPoint09()

  const accounts06 = await getSmartAccounts_06()
  const accounts07 = await getSmartAccounts_07()
  const accounts08 = await getSmartAccounts_08()
  const accounts09 = await getSmartAccounts_09()

  const account06_ = accounts06[0]
  const account07_ = accounts07[0]
  const sponsoredAccount07_ = accounts07[1]
  const account08_ = accounts08[4]
  const account09_ = accounts09[5]
  if (
    !account06_ ||
    !account07_ ||
    !sponsoredAccount07_ ||
    !account08_ ||
    !account09_
  )
    throw new Error('Smart Account fixtures are required.')

  account06 = account06_
  account07 = account07_
  sponsoredAccount07 = sponsoredAccount07_
  account08 = account08_
  account09 = account09_

  paymaster = await deployVerifyingPaymaster07(executionClient)
  paymasterServer = await createVerifyingPaymasterServer(executionClient, {
    paymaster,
  })
}, 120_000)

beforeEach(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return
  await bundler.restart()
  await bundlerControlClient.request({
    method: 'debug_bundler_setBundlingMode',
    params: ['manual'],
  })
}, 30_000)

afterAll(async () => {
  await paymasterServer?.close()
})

describe.sequential('live EntryPoint flows', () => {
  liveTest('EntryPoint 0.6', { retry: 0, timeout: 30_000 }, async () => {
    const client = BundlerClient.create({
      account: account06,
      client: executionClient,
      pollingInterval: 50,
      transport: http(bundler.rpcUrl.http),
    })
    const calls = [
      {
        to: constants.accounts[6].address,
        value: Value.fromEther('1'),
      },
    ] as const
    const balance = await CoreActions.address.getBalance(executionClient, {
      address: calls[0].to,
    })

    const prepared = await Actions.userOperation.prepare(client, {
      calls,
      ...fees,
    })
    const gas = await Actions.userOperation.estimateGas(client, {
      calls,
      ...fees,
    })
    if (!prepared.initCode)
      throw new Error('EntryPoint 0.6 init code is required.')

    expect({
      callData: prepared.callData.length > 2,
      callGasLimit: prepared.callGasLimit > 0n,
      estimatedCallGas: gas.callGasLimit > 0n,
      estimatedPreVerificationGas: gas.preVerificationGas > 0n,
      estimatedVerificationGas: gas.verificationGasLimit > 0n,
      initCode: prepared.initCode.length > 2,
      nonce: prepared.nonce >= 0n,
      sender: Address.isEqual(prepared.sender, account06.address),
    }).toMatchInlineSnapshot(`
      {
        "callData": true,
        "callGasLimit": true,
        "estimatedCallGas": true,
        "estimatedPreVerificationGas": true,
        "estimatedVerificationGas": true,
        "initCode": true,
        "nonce": true,
        "sender": true,
      }
    `)

    const hash = await Actions.userOperation.send(client, { calls, ...fees })
    const receiptPromise = Actions.userOperation.waitForReceipt<'0.6'>(client, {
      hash,
      pollingInterval: 50,
      timeout: 15_000,
    })
    await client.request({ method: 'debug_bundler_sendBundleNow' })
    await CoreActions.block.mine(executionClient, { blocks: 1 })
    const receipt = await receiptPromise
    const operation = await Actions.userOperation.get<'0.6'>(client, { hash })
    const transactionHash = getIncludedTransactionHash(operation)
    const receipt_ = await Actions.userOperation.getReceipt<'0.6'>(client, {
      hash,
    })
    const transaction = await CoreActions.transaction.get(executionClient, {
      hash: transactionHash,
    })
    const transactionReceipt = await CoreActions.transaction.getReceipt(
      executionClient,
      { hash: transactionHash },
    )

    expect({
      included: receipt.success,
      operationHash: receipt.userOpHash === hash,
      receipt: receipt_.userOpHash === receipt.userOpHash,
      sender: Address.isEqual(
        operation.userOperation.sender,
        account06.address,
      ),
      transaction: transaction.hash === transactionHash,
      transactionHash: transactionHash === receipt.receipt.transactionHash,
      transactionStatus: transactionReceipt.status,
      transferred:
        (await CoreActions.address.getBalance(executionClient, {
          address: calls[0].to,
        })) ===
        balance + calls[0].value,
    }).toMatchInlineSnapshot(`
      {
        "included": true,
        "operationHash": true,
        "receipt": true,
        "sender": true,
        "transaction": true,
        "transactionHash": true,
        "transactionStatus": "success",
        "transferred": true,
      }
    `)
  })

  liveTest('EntryPoint 0.7', { retry: 0, timeout: 30_000 }, async () => {
    const client = BundlerClient.create({
      account: account07,
      client: executionClient,
      pollingInterval: 50,
      transport: http(bundler.rpcUrl.http),
    })
    const calls = [
      {
        to: constants.accounts[7].address,
        value: Value.fromEther('1'),
      },
    ] as const
    const balance = await CoreActions.address.getBalance(executionClient, {
      address: calls[0].to,
    })

    const prepared = await Actions.userOperation.prepare(client, {
      calls,
      ...fees,
    })
    const gas = await Actions.userOperation.estimateGas(client, {
      calls,
      ...fees,
    })
    if (!prepared.factory)
      throw new Error('EntryPoint 0.7 factory is required.')

    expect({
      callData: prepared.callData.length > 2,
      callGasLimit: prepared.callGasLimit > 0n,
      estimatedCallGas: gas.callGasLimit > 0n,
      estimatedPreVerificationGas: gas.preVerificationGas > 0n,
      estimatedVerificationGas: gas.verificationGasLimit > 0n,
      factory: Address.isEqual(prepared.factory, account07.factory.address),
      nonce: prepared.nonce >= 0n,
      sender: Address.isEqual(prepared.sender, account07.address),
    }).toMatchInlineSnapshot(`
      {
        "callData": true,
        "callGasLimit": true,
        "estimatedCallGas": true,
        "estimatedPreVerificationGas": true,
        "estimatedVerificationGas": true,
        "factory": true,
        "nonce": true,
        "sender": true,
      }
    `)

    const hash = await Actions.userOperation.send(client, { calls, ...fees })
    const receiptPromise = Actions.userOperation.waitForReceipt<'0.7'>(client, {
      hash,
      pollingInterval: 50,
      timeout: 15_000,
    })
    await client.request({ method: 'debug_bundler_sendBundleNow' })
    await CoreActions.block.mine(executionClient, { blocks: 1 })
    const receipt = await receiptPromise
    const operation = await Actions.userOperation.get<'0.7'>(client, { hash })
    const transactionHash = getIncludedTransactionHash(operation)
    const receipt_ = await Actions.userOperation.getReceipt<'0.7'>(client, {
      hash,
    })
    const transaction = await CoreActions.transaction.get(executionClient, {
      hash: transactionHash,
    })
    const transactionReceipt = await CoreActions.transaction.getReceipt(
      executionClient,
      { hash: transactionHash },
    )

    expect({
      included: receipt.success,
      operationHash: receipt.userOpHash === hash,
      receipt: receipt_.userOpHash === receipt.userOpHash,
      sender: Address.isEqual(
        operation.userOperation.sender,
        account07.address,
      ),
      transaction: transaction.hash === transactionHash,
      transactionHash: transactionHash === receipt.receipt.transactionHash,
      transactionStatus: transactionReceipt.status,
      transferred:
        (await CoreActions.address.getBalance(executionClient, {
          address: calls[0].to,
        })) ===
        balance + calls[0].value,
    }).toMatchInlineSnapshot(`
      {
        "included": true,
        "operationHash": true,
        "receipt": true,
        "sender": true,
        "transaction": true,
        "transactionHash": true,
        "transactionStatus": "success",
        "transferred": true,
      }
    `)
  })

  liveTest('EntryPoint 0.8', { retry: 0, timeout: 30_000 }, async () => {
    const client = BundlerClient.create({
      account: account08,
      client: executionClient,
      pollingInterval: 50,
      transport: http(bundler.rpcUrl.http),
    })
    const calls = [
      {
        to: constants.accounts[8].address,
        value: Value.fromEther('1'),
      },
    ] as const
    const balance = await CoreActions.address.getBalance(executionClient, {
      address: calls[0].to,
    })
    const authorization = await CoreActions.wallet.signAuthorization(
      executionClient,
      account08.authorization,
    )

    const prepared = await Actions.userOperation.prepare(client, {
      authorization,
      calls,
      ...fees,
    })
    const gas = await Actions.userOperation.estimateGas(client, {
      authorization,
      calls,
      ...fees,
    })

    expect({
      authorization: prepared.authorization === authorization,
      callData: prepared.callData.length > 2,
      callGasLimit: prepared.callGasLimit > 0n,
      estimatedCallGas: gas.callGasLimit > 0n,
      estimatedPreVerificationGas: gas.preVerificationGas > 0n,
      estimatedVerificationGas: gas.verificationGasLimit > 0n,
      factory: prepared.factory === '0x7702',
      nonce: prepared.nonce >= 0n,
      sender: Address.isEqual(prepared.sender, account08.address),
    }).toMatchInlineSnapshot(`
      {
        "authorization": true,
        "callData": true,
        "callGasLimit": true,
        "estimatedCallGas": true,
        "estimatedPreVerificationGas": true,
        "estimatedVerificationGas": true,
        "factory": true,
        "nonce": true,
        "sender": true,
      }
    `)

    const hash = await Actions.userOperation.send(client, {
      authorization,
      calls,
      ...fees,
    })
    const mempool = await client.request({
      method: 'debug_bundler_dumpMempool',
      params: [account08.entryPoint.address],
    })
    if (!Array.isArray(mempool))
      throw new Error('Bundler returned an invalid mempool response.')
    if (mempool.length === 0)
      throw new Error('User Operation is missing from the mempool.')
    const receiptPromise = Actions.userOperation.waitForReceipt<'0.8'>(client, {
      hash,
      pollingInterval: 50,
      timeout: 15_000,
    })
    await client.request({ method: 'debug_bundler_sendBundleNow' })
    await CoreActions.block.mine(executionClient, { blocks: 1 })
    const receipt = await receiptPromise
    const operation = await Actions.userOperation.get<'0.8'>(client, { hash })
    const transactionHash = getIncludedTransactionHash(operation)
    const receipt_ = await Actions.userOperation.getReceipt<'0.8'>(client, {
      hash,
    })
    const transaction = await CoreActions.transaction.get(executionClient, {
      hash: transactionHash,
    })
    const transactionReceipt = await CoreActions.transaction.getReceipt(
      executionClient,
      { hash: transactionHash },
    )

    expect({
      hash: hash.length === 66,
      included: receipt.success,
      mempool: mempool.length,
      operationHash: receipt.userOpHash === hash,
      receipt: receipt_.userOpHash === receipt.userOpHash,
      sender: Address.isEqual(
        operation.userOperation.sender,
        account08.address,
      ),
      transaction: transaction.hash === transactionHash,
      transactionHash: transactionHash === receipt.receipt.transactionHash,
      transactionStatus: transactionReceipt.status,
      transferred:
        (await CoreActions.address.getBalance(executionClient, {
          address: calls[0].to,
        })) ===
        balance + calls[0].value,
    }).toMatchInlineSnapshot(`
      {
        "hash": true,
        "included": true,
        "mempool": 1,
        "operationHash": true,
        "receipt": true,
        "sender": true,
        "transaction": true,
        "transactionHash": true,
        "transactionStatus": "success",
        "transferred": true,
      }
    `)
  })

  liveTest('EntryPoint 0.9', { retry: 0, timeout: 30_000 }, async () => {
    await bundler09.restart()
    await bundler09ControlClient.request({
      method: 'debug_bundler_setBundlingMode',
      params: ['manual'],
    })

    const client = BundlerClient.create({
      account: account09,
      client: executionClient,
      pollingInterval: 50,
      transport: http(bundler09.rpcUrl.http),
    })
    const calls = [
      {
        to: constants.accounts[9].address,
        value: Value.fromEther('1'),
      },
    ] as const
    const balance = await CoreActions.address.getBalance(executionClient, {
      address: calls[0].to,
    })
    const authorization = await CoreActions.wallet.signAuthorization(
      executionClient,
      account09.authorization,
    )

    const prepared = await Actions.userOperation.prepare(client, {
      authorization,
      calls,
      ...fees,
    })
    const gas = await Actions.userOperation.estimateGas(client, {
      authorization,
      calls,
      ...fees,
    })

    expect({
      authorization: prepared.authorization === authorization,
      callData: prepared.callData.length > 2,
      callGasLimit: prepared.callGasLimit > 0n,
      estimatedCallGas: gas.callGasLimit > 0n,
      estimatedPreVerificationGas: gas.preVerificationGas > 0n,
      estimatedVerificationGas: gas.verificationGasLimit > 0n,
      factory: prepared.factory === '0x7702',
      nonce: prepared.nonce >= 0n,
      sender: Address.isEqual(prepared.sender, account09.address),
    }).toMatchInlineSnapshot(`
      {
        "authorization": true,
        "callData": true,
        "callGasLimit": true,
        "estimatedCallGas": true,
        "estimatedPreVerificationGas": true,
        "estimatedVerificationGas": true,
        "factory": true,
        "nonce": true,
        "sender": true,
      }
    `)

    const hash = await Actions.userOperation.send(client, {
      authorization,
      calls,
      ...fees,
    })
    const mempool = await client.request({
      method: 'debug_bundler_dumpMempool',
      params: [account09.entryPoint.address],
    })
    if (!Array.isArray(mempool))
      throw new Error('Bundler returned an invalid mempool response.')
    if (mempool.length === 0)
      throw new Error('User Operation is missing from the mempool.')
    const receiptPromise = Actions.userOperation.waitForReceipt<'0.9'>(client, {
      hash,
      pollingInterval: 50,
      timeout: 15_000,
    })
    await client.request({ method: 'debug_bundler_sendBundleNow' })
    await CoreActions.block.mine(executionClient, { blocks: 1 })
    const receipt = await receiptPromise
    const receipt_ = await Actions.userOperation.getReceipt<'0.9'>(client, {
      hash,
    })
    const transaction = await CoreActions.transaction.get(executionClient, {
      hash: receipt.receipt.transactionHash,
    })
    const transactionReceipt = await CoreActions.transaction.getReceipt(
      executionClient,
      { hash: receipt.receipt.transactionHash },
    )
    const [operationLog] = AbiEvent.extractLogs(
      account09.entryPoint.abi,
      transactionReceipt.logs.filter((log) =>
        Address.isEqual(log.address, account09.entryPoint.address),
      ),
      {
        args: { userOpHash: hash },
        eventName: 'UserOperationEvent',
        strict: true,
      },
    )
    if (!operationLog) throw new Error('`UserOperationEvent` was not emitted.')

    expect({
      eventBlockHash: operationLog.blockHash === transactionReceipt.blockHash,
      eventBlockNumber:
        operationLog.blockNumber === transactionReceipt.blockNumber,
      eventEntryPoint: Address.isEqual(
        operationLog.address,
        account09.entryPoint.address,
      ),
      eventHash: operationLog.args.userOpHash === hash,
      eventSender: Address.isEqual(operationLog.args.sender, account09.address),
      eventSuccess: operationLog.args.success,
      eventTransaction:
        operationLog.transactionHash === transactionReceipt.transactionHash &&
        operationLog.transactionHash === receipt.receipt.transactionHash,
      hash: hash.length === 66,
      included: receipt.success,
      mempool: mempool.length,
      operationHash: receipt.userOpHash === operationLog.args.userOpHash,
      receipt: receipt_.userOpHash === receipt.userOpHash,
      receiptEntryPoint: Address.isEqual(
        receipt.entryPoint,
        operationLog.address,
      ),
      sender: Address.isEqual(receipt.sender, operationLog.args.sender),
      transaction: transaction.hash === receipt.receipt.transactionHash,
      transactionEntryPoint:
        transaction.to !== null &&
        Address.isEqual(transaction.to, account09.entryPoint.address),
      transactionHash:
        receipt_.receipt.transactionHash === receipt.receipt.transactionHash,
      transactionStatus: transactionReceipt.status,
      transferred:
        (await CoreActions.address.getBalance(executionClient, {
          address: calls[0].to,
        })) ===
        balance + calls[0].value,
    }).toMatchInlineSnapshot(`
      {
        "eventBlockHash": true,
        "eventBlockNumber": true,
        "eventEntryPoint": true,
        "eventHash": true,
        "eventSender": true,
        "eventSuccess": true,
        "eventTransaction": true,
        "hash": true,
        "included": true,
        "mempool": 1,
        "operationHash": true,
        "receipt": true,
        "receiptEntryPoint": true,
        "sender": true,
        "transaction": true,
        "transactionEntryPoint": true,
        "transactionHash": true,
        "transactionStatus": "success",
        "transferred": true,
      }
    `)
  })

  liveTest(
    'EntryPoint 0.9 gets an included User Operation by hash',
    { retry: 0, timeout: 30_000 },
    async () => {
      await bundler09.restart()
      await bundler09ControlClient.request({
        method: 'debug_bundler_setBundlingMode',
        params: ['manual'],
      })

      const client = BundlerClient.create({
        account: account09,
        client: executionClient,
        pollingInterval: 50,
        transport: http(bundler09.rpcUrl.http),
      })
      const calls = [
        {
          to: constants.accounts[9].address,
          value: Value.fromEther('1'),
        },
      ] as const
      const authorization = await CoreActions.wallet.signAuthorization(
        executionClient,
        account09.authorization,
      )

      const hash = await Actions.userOperation.send(client, {
        authorization,
        calls,
        ...fees,
      })
      const receiptPromise = Actions.userOperation.waitForReceipt<'0.9'>(
        client,
        { hash, pollingInterval: 50, timeout: 15_000 },
      )
      await client.request({ method: 'debug_bundler_sendBundleNow' })
      await CoreActions.block.mine(executionClient, { blocks: 1 })
      const receipt = await receiptPromise

      const operation = await Actions.userOperation.get<'0.9'>(client, {
        hash,
      })
      const transactionHash = getIncludedTransactionHash(operation)
      expect({
        entryPoint: Address.isEqual(
          operation.entryPoint,
          account09.entryPoint.address,
        ),
        included: receipt.success,
        sender: Address.isEqual(
          operation.userOperation.sender,
          account09.address,
        ),
        transactionHash: transactionHash === receipt.receipt.transactionHash,
      }).toMatchInlineSnapshot(`
        {
          "entryPoint": true,
          "included": true,
          "sender": true,
          "transactionHash": true,
        }
      `)
    },
  )

  liveTest(
    'ERC-7677 PaymasterClient',
    { retry: 0, timeout: 30_000 },
    async () => {
      const paymasterClient = PaymasterClient.create({
        transport: http(paymasterServer.url),
      })
      const client = BundlerClient.create({
        account: sponsoredAccount07,
        client: executionClient,
        paymaster: paymasterClient,
        pollingInterval: 50,
        transport: http(bundler.rpcUrl.http),
      })
      const calls = [
        {
          to: constants.accounts[5].address,
          value: Value.fromEther('1'),
        },
      ] as const
      const balance = await CoreActions.address.getBalance(executionClient, {
        address: calls[0].to,
      })

      const prepared = await Actions.userOperation.prepare(client, {
        calls,
        ...fees,
      })
      if (
        !prepared.paymaster ||
        !prepared.paymasterData ||
        prepared.paymasterPostOpGasLimit === undefined ||
        prepared.paymasterVerificationGasLimit === undefined
      )
        throw new Error('Paymaster fields are required.')
      expect({
        paymaster: Address.isEqual(prepared.paymaster, paymaster),
        paymasterData: prepared.paymasterData.length > 2,
        paymasterPostOpGasLimit: prepared.paymasterPostOpGasLimit > 0n,
        paymasterVerificationGasLimit:
          prepared.paymasterVerificationGasLimit > 0n,
      }).toMatchInlineSnapshot(`
      {
        "paymaster": true,
        "paymasterData": true,
        "paymasterPostOpGasLimit": true,
        "paymasterVerificationGasLimit": true,
      }
    `)

      const hash = await Actions.userOperation.send(client, { calls, ...fees })
      const receiptPromise = Actions.userOperation.waitForReceipt<'0.7'>(
        client,
        {
          hash,
          pollingInterval: 50,
          timeout: 15_000,
        },
      )
      await client.request({ method: 'debug_bundler_sendBundleNow' })
      await CoreActions.block.mine(executionClient, { blocks: 1 })
      const receipt = await receiptPromise
      const operation = await Actions.userOperation.get<'0.7'>(client, { hash })
      const transactionHash = getIncludedTransactionHash(operation)
      const receipt_ = await Actions.userOperation.getReceipt<'0.7'>(client, {
        hash,
      })
      const transaction = await CoreActions.transaction.get(executionClient, {
        hash: transactionHash,
      })

      expect({
        included: receipt.success,
        operationHash: receipt.userOpHash === hash,
        paymaster: receipt.paymaster
          ? Address.isEqual(receipt.paymaster, paymaster)
          : false,
        receipt: receipt_.userOpHash === receipt.userOpHash,
        transaction: transaction.hash === transactionHash,
        transferred:
          (await CoreActions.address.getBalance(executionClient, {
            address: calls[0].to,
          })) ===
          balance + calls[0].value,
      }).toMatchInlineSnapshot(`
      {
        "included": true,
        "operationHash": true,
        "paymaster": true,
        "receipt": true,
        "transaction": true,
        "transferred": true,
      }
    `)
    },
  )
})
