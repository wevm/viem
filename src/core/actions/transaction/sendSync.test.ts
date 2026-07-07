import * as AbiFunction from 'ox/AbiFunction'
import * as Authorization from 'ox/Authorization'
import * as TransactionRequest from 'ox/TransactionRequest'
import * as Value from 'ox/Value'
import { z } from 'ox/zod'
import { describe, expect, test } from 'vitest'

import {
  Account,
  Actions,
  Chain,
  Client,
  NonceManager,
  RpcError,
  http,
  testActions,
} from 'viem'
import { mainnet, optimism } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = client.extend(testActions())

const source = constants.accounts[0]
const target = constants.accounts[1]
const to = target.address
const local = Account.fromPrivateKey(source.privateKey)
const jsonRpc = Account.from(source.address)

const accountCases = [
  ['json-rpc', jsonRpc],
  ['local', local],
] as const

async function setup() {
  await testClient.block.setAutomine({ enabled: true })
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
  await testClient.address.setBalance({
    address: target.address,
    value: target.balance,
  })
  await testClient.block.setNextBaseFeePerGas({
    baseFeePerGas: Value.fromGwei('10'),
  })
  await testClient.block.mine({ blocks: 1 })
}

describe.each(accountCases)('account: %s', (name, account) => {
  test('sends a value transfer and returns the receipt', async () => {
    await setup()
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('sends without value', async () => {
    await setup()
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      pollingInterval: 50,
      to,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('args: gasPrice', async () => {
    await setup()
    const gasPrice = Value.fromGwei('20')
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      gasPrice,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.gasPrice).toBe(gasPrice)
  })

  test('args: maxFeePerGas', async () => {
    await setup()
    const maxFeePerGas = Value.fromGwei('20')
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      maxFeePerGas,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.maxFeePerGas).toBe(maxFeePerGas)
  })

  test('args: maxPriorityFeePerGas', async () => {
    await setup()
    const maxPriorityFeePerGas = Value.fromGwei('1')
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      maxPriorityFeePerGas,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.maxPriorityFeePerGas).toBe(maxPriorityFeePerGas)
  })

  test('args: maxPriorityFeePerGas + maxFeePerGas', async () => {
    await setup()
    const maxPriorityFeePerGas = Value.fromGwei('10')
    const maxFeePerGas = Value.fromGwei('20')
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      maxFeePerGas,
      maxPriorityFeePerGas,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.maxFeePerGas).toBe(maxFeePerGas)
    expect(transaction.maxPriorityFeePerGas).toBe(maxPriorityFeePerGas)
  })

  test('args: nonce', async () => {
    await setup()
    const nonce = await Actions.address.getTransactionCount(client, {
      address: source.address,
    })
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      nonce,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.nonce).toBe(BigInt(nonce))
  })

  test('args: gas', async () => {
    await setup()
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      gas: 30_000n,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.gas).toBe(30_000n)
  })

  test('args: chain', async () => {
    await setup()
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      chain: mainnet,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: chain schema', async () => {
    await setup()
    const chain = mainnet.extend({
      schema: {
        transactionRequest: {
          toRpc: z.codec(z.any(), z.any(), {
            decode: (rpc) => rpc,
            encode: (request) => TransactionRequest.toRpc(request),
          }),
        },
      },
    })
    const client = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      pollingInterval: 50,
      to,
      value: Value.fromEther('1'),
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: client dataSuffix object format', async () => {
    await setup()
    const client = Client.create({
      dataSuffix: { required: true, value: '0x12345678' },
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      data: '0xab',
      gas: 100_000n,
      pollingInterval: 50,
      to,
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.input).toBe('0xab12345678')
  })

  test('behavior: action dataSuffix overrides client dataSuffix', async () => {
    await setup()
    const client = Client.create({
      dataSuffix: { required: true, value: '0xabc0' },
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      data: '0xab',
      dataSuffix: '0x12345678',
      gas: 100_000n,
      pollingInterval: 50,
      to,
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.input).toBe('0xab12345678')
  })

  test('behavior: action dataSuffix is used when calldata is omitted', async () => {
    await setup()
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      dataSuffix: '0x12345678',
      gas: 100_000n,
      pollingInterval: 50,
      to,
    })
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.input).toBe('0x12345678')
  })

  test('behavior: deploys a contract when `to` is omitted', async () => {
    await setup()
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      data: generated.Events.bytecode.object,
      pollingInterval: 50,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt.contractAddress).toBeDefined()
  })

  test('behavior: deploys a contract when `to` is null', async () => {
    await setup()
    const receipt = await Actions.transaction.sendSync(client, {
      account,
      data: generated.Events.bytecode.object,
      pollingInterval: 50,
      to: null,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt.contractAddress).toBeDefined()
  })

  test('args: throwOnReceiptRevert', async () => {
    await setup()
    const { address } = await contract.deploy(client, {
      bytecode: generated.ErrorsExample.bytecode.object,
    })
    const data = AbiFunction.encodeData(
      AbiFunction.fromAbi(generated.ErrorsExample.abi, 'revertWrite'),
    )
    const error = await Actions.transaction
      .sendSync(client, {
        account,
        data,
        gas: 100_000n,
        pollingInterval: 50,
        throwOnReceiptRevert: true,
        to: address,
      })
      .catch((error) => error)
    expect(error.name).toMatchInlineSnapshot(
      `"TransactionReceipt.RevertedError"`,
    )
  })

  describe('errors', () => {
    test('gasPrice exceeds account funds', async () => {
      await setup()
      const error = await Actions.transaction
        .sendSync(client, {
          account,
          gasPrice: Value.fromGwei('10') + Value.fromEther('10000'),
          pollingInterval: 50,
          to,
          value: Value.fromEther('1'),
        })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      expect(error.cause).toBeInstanceOf(RpcError.InsufficientFundsError)
    })

    test('fee cap too high', async () => {
      await setup()
      const error = await Actions.transaction
        .sendSync(client, {
          account,
          maxFeePerGas: 2n ** 256n,
          pollingInterval: 50,
          to,
          value: Value.fromEther('1'),
        })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      expect(error.cause).toBeInstanceOf(RpcError.FeeCapTooHighError)
    })

    test('tip higher than fee cap', async () => {
      await setup()
      const error = await Actions.transaction
        .sendSync(client, {
          account,
          maxFeePerGas: Value.fromGwei('10'),
          maxPriorityFeePerGas: Value.fromGwei('11'),
          pollingInterval: 50,
          to,
          value: Value.fromEther('1'),
        })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      expect(error.cause).toBeInstanceOf(RpcError.TipAboveFeeCapError)
    })

    test('gas too low', async () => {
      await setup()
      const error = await Actions.transaction
        .sendSync(client, {
          account,
          gas: 100n,
          pollingInterval: 50,
          to,
          value: Value.fromEther('1'),
        })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      expect(error.cause).toBeInstanceOf(RpcError.IntrinsicGasTooLowError)
    })

    test('gas too high', async () => {
      await setup()
      const error = await Actions.transaction
        .sendSync(client, {
          account,
          gas: 100_000_000n,
          pollingInterval: 50,
          to,
          value: Value.fromEther('1'),
        })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      expect(error.cause).toBeInstanceOf(RpcError.IntrinsicGasTooHighError)
    })

    test('gas fee is less than block base fee', async () => {
      await setup()
      const error = await Actions.transaction
        .sendSync(client, {
          account,
          maxFeePerGas: 1n,
          pollingInterval: 50,
          to,
          value: Value.fromEther('1'),
        })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      if (name === 'json-rpc')
        expect(error.cause).toBeInstanceOf(RpcError.FeeCapTooLowError)
      else expect(error.cause).toBeInstanceOf(RpcError.TipAboveFeeCapError)
    })

    test('insufficient funds', async () => {
      await setup()
      const error = await Actions.transaction
        .sendSync(client, {
          account,
          pollingInterval: 50,
          to,
          value: Value.fromEther('100000'),
        })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      expect(error.cause).toBeInstanceOf(RpcError.InsufficientFundsError)
    })

    test('cannot infer `to` from `authorizationList`', async () => {
      const error = await Actions.transaction
        .sendSync(client, {
          account,
          authorizationList: [
            {
              address: '0x0000000000000000000000000000000000000000',
              chainId: 1,
              nonce: 0n,
            },
          ] as never,
        })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      expect(error.cause?.message).toContain(
        '`to` is required. Could not infer from `authorizationList`.',
      )
    })
  })
})

test('sends a signed serialized transaction synchronously', async () => {
  await setup()
  const transaction = await Actions.transaction.sign(client, {
    account: local,
    prepare: true,
    to,
    value: Value.fromEther('1'),
  })
  const receipt = await Actions.transaction.sendRawSync(client, { transaction })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('behavior: account as address string', async () => {
  await setup()
  const receipt = await Actions.transaction.sendSync(client, {
    account: source.address,
    pollingInterval: 50,
    to,
    value: Value.fromEther('1'),
  })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('behavior: inferred account from client', async () => {
  await setup()
  const client = Client.create({
    account: source.address,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const receipt = await Actions.transaction.sendSync(client, {
    gas: 1_000_000n,
    pollingInterval: 50,
    to,
    value: Value.fromEther('1'),
  })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

describe('json-rpc account chain assertions', () => {
  test('chain mismatch throws', async () => {
    const client = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const error = await Actions.transaction
      .sendSync(client, {
        account: jsonRpc,
        pollingInterval: 50,
        to,
        value: Value.fromEther('1'),
      })
      .catch((error) => error)
    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.cause).toBeInstanceOf(Chain.MismatchError)
  })

  test('chain: null skips the current-chain assertion', async () => {
    await setup()
    const client = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const receipt = await Actions.transaction.sendSync(client, {
      account: jsonRpc,
      chain: null,
      pollingInterval: 50,
      to,
      value: 1n,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('assertChainId: false skips the current-chain assertion', async () => {
    await setup()
    const client = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const receipt = await Actions.transaction.sendSync(client, {
      account: jsonRpc,
      assertChainId: false,
      pollingInterval: 50,
      to,
      value: 1n,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })
})

test('behavior: eip7702 infers `to` from the authorization list', async () => {
  await setup()
  const authority = Account.fromPrivateKey(constants.accounts[1].privateKey)
  const authorization = await authority.signAuthorization!(
    Authorization.from({
      address: '0x0000000000000000000000000000000000000000',
      chainId: 1,
      nonce: 0n,
    }),
  )
  const receipt = await Actions.transaction.sendSync(client, {
    account: local,
    authorizationList: [authorization],
    type: 'eip7702',
  })
  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

describe('behavior: nonceManager', () => {
  test('derives the nonce from the account nonce manager', async () => {
    await setup()
    const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
    const account = {
      ...Account.fromPrivateKey(constants.accounts[0].privateKey),
      nonceManager,
    }

    const [a, b] = await Promise.all([
      Actions.transaction.sendSync(client, { account, to, value: 1n }),
      Actions.transaction.sendSync(client, { account, to, value: 1n }),
    ])
    const [transactionA, transactionB] = await Promise.all([
      Actions.transaction.get(client, { hash: a.transactionHash }),
      Actions.transaction.get(client, { hash: b.transactionHash }),
    ])
    expect(transactionB.nonce).toBe(transactionA.nonce + 1n)
  })

  test('resets the nonce when the send fails', async () => {
    await setup()
    const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
    const account = {
      ...Account.fromPrivateKey(constants.accounts[3].privateKey),
      nonceManager,
    }
    const error = await Actions.transaction
      .sendSync(client, { account, gas: 100n, to, value: 1n })
      .catch((error) => error)
    expect(error).toBeInstanceOf(RpcError.ExecutionError)

    const receipt = await Actions.transaction.sendSync(client, {
      account,
      to,
      value: 1n,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })
})

test('errors: no account', async () => {
  await expect(() =>
    Actions.transaction.sendSync(client, { to, value: 1n }),
  ).rejects.toThrowError(Account.NotFoundError)
})
