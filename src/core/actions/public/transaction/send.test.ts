import * as AbiFunction from 'ox/AbiFunction'
import * as Authorization from 'ox/Authorization'
import * as Errors from 'ox/Errors'
import * as Value from 'ox/Value'
import { describe, expect, test } from 'vitest'

import {
  Account,
  Actions,
  Client,
  http,
  RpcError,
  NonceManager,
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
const to = constants.accounts[1].address

describe.each([
  ['json-rpc', jsonRpc],
  ['local', local],
] as const)('account: %s', (_name, account) => {
  test('sends a value transfer', async () => {
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

describe('behavior: dataSuffix', () => {
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
})

describe('behavior: eip7702', () => {
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

describe('behavior: chain', () => {
  test('chain: null skips the current-chain assertion (json-rpc)', async () => {
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
})

describe('errors', () => {
  test('no account', async () => {
    await expect(() =>
      Actions.transaction.send(client, { to, value: 1n }),
    ).rejects.toThrowError(Account.NotFoundError)
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
