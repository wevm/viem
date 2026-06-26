import * as AbiFunction from 'ox/AbiFunction'
import * as Authorization from 'ox/Authorization'
import * as Errors from 'ox/Errors'
import * as TransactionRequest from 'ox/TransactionRequest'
import * as Value from 'ox/Value'
import { z } from 'ox/zod'
import { describe, expect, test } from 'vitest'

import {
  Account,
  Actions,
  Chain,
  Client,
  http,
  NonceManager,
  RpcError,
  testActions,
} from 'viem'
import { mainnet, optimism } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const local = Account.fromPrivateKey(constants.accounts[0].privateKey)
const jsonRpc = Account.from(constants.accounts[0].address)
const source = constants.accounts[0]
const target = constants.accounts[1]
const to = target.address

async function setup() {
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

describe.each([
  ['json-rpc', jsonRpc],
  ['local', local],
] as const)('account: %s', (_name, account) => {
  test('sends a value transfer', async () => {
    await setup()
    const hash = await Actions.transaction.send(client, {
      account,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})

test('behavior: account as address string', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toBe('success')
})

test('behavior: inferred account from client', async () => {
  await setup()
  const client = Client.create({
    account: source.address,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const hash = await Actions.transaction.send(client, {
    gas: 1_000_000n,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toBe('success')
})

test('behavior: no value (local)', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: local,
    to,
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toBe('success')
})

describe('args: gasPrice', () => {
  test('sends transaction', async () => {
    await setup()
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      gasPrice: Value.fromGwei('20'),
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })

  test('errors when account has insufficient funds', async () => {
    await setup()
    const error = await Actions.transaction
      .send(client, {
        account: jsonRpc,
        gasPrice: Value.fromGwei('10') + Value.fromEther('10000'),
        to,
        value: Value.fromEther('1'),
      })
      .catch((error) => error)
    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.cause).toBeInstanceOf(RpcError.InsufficientFundsError)
  })
})

describe('args: maxFeePerGas', () => {
  test('sends transaction', async () => {
    await setup()
    const maxFeePerGas = Value.fromGwei('20')
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      maxFeePerGas,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.maxFeePerGas).toBe(maxFeePerGas)
  })

  test('errors when account has insufficient funds', async () => {
    await setup()
    const error = await Actions.transaction
      .send(client, {
        account: jsonRpc,
        maxFeePerGas: Value.fromGwei('10') + Value.fromEther('10000'),
        to,
        value: Value.fromEther('1'),
      })
      .catch((error) => error)
    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.cause).toBeInstanceOf(RpcError.InsufficientFundsError)
  })
})

describe('args: maxPriorityFeePerGas', () => {
  test('sends transaction', async () => {
    await setup()
    const maxPriorityFeePerGas = Value.fromGwei('1')
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      maxPriorityFeePerGas,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.maxPriorityFeePerGas).toBe(maxPriorityFeePerGas)
  })

  test('maxPriorityFeePerGas + maxFeePerGas: sends transaction', async () => {
    await setup()
    const maxPriorityFeePerGas = Value.fromGwei('10')
    const maxFeePerGas = Value.fromGwei('20')
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.maxFeePerGas).toBe(maxFeePerGas)
    expect(transaction.maxPriorityFeePerGas).toBe(maxPriorityFeePerGas)
  })
})

describe('args: nonce', () => {
  test('sends transaction', async () => {
    await setup()
    const nonce = await Actions.address.getTransactionCount(client, {
      address: source.address,
    })
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      nonce,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.nonce).toBe(BigInt(nonce))
  })
})

// TODO: test blob (EIP-4844) sends once the anvil fork can fill blob
// transactions (currently covered via the ephemeral server in fill.test.ts).
describe('args: gas', () => {
  test('sends transaction (local)', async () => {
    await setup()
    const hash = await Actions.transaction.send(client, {
      account: local,
      gas: 30_000n,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.gas).toBe(30_000n)
  })
})

describe('args: chain', () => {
  test('default', async () => {
    await setup()
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      chain: mainnet,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })

  test('nullish', async () => {
    await setup()
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      chain: null,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })

  test('chain mismatch throws', async () => {
    const client = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const error = await Actions.transaction
      .send(client, {
        account: jsonRpc,
        to,
        value: Value.fromEther('1'),
      })
      .catch((error) => error)
    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.cause).toBeInstanceOf(Chain.MismatchError)
  })

  test('chain: null skips the current-chain assertion (json-rpc)', async () => {
    await setup()
    // `optimism` (id 10) mismatches the connected chain (id 1); `chain: null`
    // skips the assertion so the json-rpc send still broadcasts.
    const client = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      chain: null,
      to,
      value: 1n,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })

  test('assertChainId: false skips the current-chain assertion (json-rpc)', async () => {
    await setup()
    const client = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      assertChainId: false,
      to,
      value: 1n,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})

describe('behavior: chain schema', () => {
  test('encodes the json-rpc request via the chain request codec', async () => {
    await setup()
    const chain = mainnet.extend({
      schema: {
        transactionRequest: {
          toRpc: z.pipe(
            z.any(),
            z.transform((request) => TransactionRequest.toRpc(request)),
          ),
        },
      },
    })
    const client = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})

describe('behavior: dataSuffix', () => {
  // TODO: support and test the `{ value, required }` object form of `dataSuffix`.
  test('appends the suffix to the calldata', async () => {
    const hash = await Actions.transaction.send(client, {
      account: local,
      data: '0xdead',
      dataSuffix: '0xbeef',
      to,
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.input).toBe('0xdeadbeef')
  })

  test('appends the suffix when no calldata is provided', async () => {
    const hash = await Actions.transaction.send(client, {
      account: local,
      dataSuffix: '0xbeef',
      to,
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.input).toBe('0xbeef')
  })

  test('falls back to client.dataSuffix', async () => {
    const client = Client.create({
      dataSuffix: '0xc0de',
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const hash = await Actions.transaction.send(client, {
      account: local,
      data: '0xab',
      to,
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.input).toBe('0xabc0de')
  })

  test('client.dataSuffix (json-rpc)', async () => {
    const client = Client.create({
      dataSuffix: '0x12345678',
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      data: '0xab',
      gas: 100_000n,
      to,
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.input).toBe('0xab12345678')
  })

  test('send dataSuffix overrides client.dataSuffix', async () => {
    const client = Client.create({
      dataSuffix: '0xabc0',
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const hash = await Actions.transaction.send(client, {
      account: local,
      data: '0xab',
      dataSuffix: '0x12345678',
      to,
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.input).toBe('0xab12345678')
  })
})

describe('behavior: deployment', () => {
  test('deploys a contract when `to` is omitted', async () => {
    const hash = await Actions.transaction.send(client, {
      account: local,
      data: generated.Events.bytecode.object,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
    expect(receipt.contractAddress).toBeDefined()
  })

  test('deploys a contract when `to` is null', async () => {
    const hash = await Actions.transaction.send(client, {
      account: local,
      data: generated.Events.bytecode.object,
      to: null,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
    expect(receipt.contractAddress).toBeDefined()
  })
})

describe('behavior: eip7702', () => {
  // TODO: test cross-chain and self-executing authorization-list sends once a
  // `Delegation` contract and an anvil sepolia instance exist in the test tree.
  test('infers `to` from the authorization list', async () => {
    const authority = Account.fromPrivateKey(constants.accounts[1].privateKey)
    const authorization = await authority.signAuthorization!(
      Authorization.from({
        address: '0x0000000000000000000000000000000000000000',
        chainId: 1,
        nonce: 0n,
      }),
    )
    const hash = await Actions.transaction.send(client, {
      account: local,
      authorizationList: [authorization],
      type: 'eip7702',
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})

describe('behavior: nonceManager', () => {
  test('derives the nonce from the account nonce manager', async () => {
    const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
    const account = {
      ...Account.fromPrivateKey(constants.accounts[0].privateKey),
      nonceManager,
    }

    const hashes = await Promise.all([
      Actions.transaction.send(client, { account, to, value: 1n }),
      Actions.transaction.send(client, { account, to, value: 1n }),
    ])
    await testClient.block.mine({ blocks: 1 })

    const [a, b] = await Promise.all(
      hashes.map((hash) => Actions.transaction.get(client, { hash })),
    )
    expect(b.nonce).toBe(a.nonce + 1n)
  })

  test('resets the nonce when the send fails', async () => {
    const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
    const account = {
      ...Account.fromPrivateKey(constants.accounts[3].privateKey),
      nonceManager,
    }
    const error = await Actions.transaction
      .send(client, { account, gas: 100n, to, value: 1n })
      .catch((error) => error)
    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    // The consumed nonce was released, so the next send reuses it.
    const hash = await Actions.transaction.send(client, {
      account,
      to,
      value: 1n,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })

  test('derives the nonce reset key from the chain', async () => {
    const client = Client.create({
      chain: mainnet,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
    const account = {
      ...Account.fromPrivateKey(constants.accounts[2].privateKey),
      nonceManager,
    }

    const hashes = await Promise.all([
      Actions.transaction.send(client, { account, to, value: 1n }),
      Actions.transaction.send(client, { account, to, value: 1n }),
    ])
    await testClient.block.mine({ blocks: 1 })

    const [a, b] = await Promise.all(
      hashes.map((hash) => Actions.transaction.get(client, { hash })),
    )
    expect(b.nonce).toBe(a.nonce + 1n)
  })
})

describe('errors', () => {
  test('no account', async () => {
    await expect(() =>
      Actions.transaction.send(client, { to, value: 1n }),
    ).rejects.toThrowError(Account.NotFoundError)
  })

  test('fee cap too high', async () => {
    await setup()
    const error = await Actions.transaction
      .send(client, {
        account: jsonRpc,
        maxFeePerGas: 2n ** 256n,
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
      .send(client, {
        account: jsonRpc,
        maxFeePerGas: Value.fromGwei('10'),
        maxPriorityFeePerGas: Value.fromGwei('11'),
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
      .send(client, {
        account: jsonRpc,
        gas: 100n,
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
      .send(client, {
        account: jsonRpc,
        gas: 100_000_000n,
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
      .send(client, {
        account: jsonRpc,
        maxFeePerGas: 1n,
        to,
        value: Value.fromEther('1'),
      })
      .catch((error) => error)
    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.cause).toBeInstanceOf(RpcError.FeeCapTooLowError)
  })

  test('insufficient funds', async () => {
    await setup()
    const error = await Actions.transaction
      .send(client, {
        account: jsonRpc,
        to,
        value: Value.fromEther('100000'),
      })
      .catch((error) => error)
    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.cause).toBeInstanceOf(RpcError.InsufficientFundsError)
  })

  test('cannot infer `to` from `authorizationList`', async () => {
    const error = await Actions.transaction
      .send(client, {
        account: local,
        // An unsigned authorization cannot be recovered, so `to` cannot be
        // inferred from it.
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

  test('execution reverted maps to RpcError.ExecutionError', async () => {
    const { address } = await contract.deploy(client, {
      bytecode: generated.Erc721.bytecode.object,
    })
    // `ownerOf` of a nonexistent token reverts during gas estimation.
    const ownerOf = AbiFunction.from(
      'function ownerOf(uint256 tokenId) returns (address)',
    )
    const error = await Actions.transaction
      .send(client, {
        account: local,
        data: AbiFunction.encodeData(ownerOf, [12517631n]),
        to: address,
      })
      .catch((error) => error)

    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.cause).toBeInstanceOf(RpcError.ExecutionRevertedError)
    expect(error.metaMessages?.join('\n')).toContain('Request Arguments:')
  })
})

describe('RpcError.ExecutionError', () => {
  test('renders fees, value and request args', () => {
    const error = new RpcError.ExecutionError(
      new Errors.BaseError('reverted'),
      {
        account: Account.from('0x0000000000000000000000000000000000000000'),
        chain: mainnet,
        data: '0xdeadbeef',
        gas: 21000n,
        maxFeePerGas: 3000000000n,
        maxPriorityFeePerGas: 1000000000n,
        nonce: 1,
        to: '0x1111111111111111111111111111111111111111',
        value: 1000000000000000000n,
      },
    )
    expect(error.message).toMatchInlineSnapshot(`
      "reverted

      Request Arguments:
        chain:                 Ethereum (id: 1)
        from:                  0x0000000000000000000000000000000000000000
        data:                  0xdeadbeef
        gas:                   21000
        maxFeePerGas:          3 gwei
        maxPriorityFeePerGas:  1 gwei
        nonce:                 1
        to:                    0x1111111111111111111111111111111111111111
        value:                 1 ETH

      Details: reverted
      Version: viem@2.52.1"
    `)
  })
})

test('error: aborted request is not wrapped', async () => {
  await setup()
  const controller = new AbortController()
  controller.abort()
  const error = await Actions.transaction
    .send(client, {
      account: jsonRpc,
      to,
      value: 1n,
      requestOptions: { signal: controller.signal },
    })
    .catch((error) => error)
  expect(error).not.toBeInstanceOf(RpcError.ExecutionError)
})
