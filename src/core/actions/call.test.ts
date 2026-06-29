import * as AbiFunction from 'ox/AbiFunction'
import * as AbiParameters from 'ox/AbiParameters'
import * as Hex from 'ox/Hex'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as testConstants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { describe, expect, test } from 'vitest'

import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

import * as Errors from '../Errors.js'
import * as RpcError from '../RpcError.js'
import * as constants from './internal/constants.js'
import * as multicall from './internal/multicall.js'
import {
  CounterfactualDeploymentFailedError,
  getRevertErrorData,
} from './call.js'

const multicall3 = '0xcA11bde05977b3631167028862bE2a173976CA11'

const client = anvil.getClient(anvil.mainnet)

// Self-hosted ERC-721 (`name()` returns "wagmi").
const { address, blockNumber } = await contract.deploy(client, {
  bytecode: generated.Erc721.bytecode.object,
})

const name4bytes = '0x06fdde03'
const mint4bytes = '0x1249c58b'
const totalSupply4bytes = '0x18160ddd'
const getCurrentBlockTimestamp4bytes = '0x0f28c97d'

const sourceAccount = testConstants.accounts[0]

const nameAbi = AbiFunction.from('function name() returns (string)')

test('default', async () => {
  const { data } = await Actions.call(client, {
    account: sourceAccount.address,
    data: name4bytes,
    to: address,
  })
  expect(data).toMatchInlineSnapshot(
    '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000"',
  )
})

test('zero data', async () => {
  const { data } = await Actions.call(client, {
    account: sourceAccount.address,
    data: mint4bytes,
    to: address,
  })
  expect(data).toBeUndefined()
})

test('args: blockNumber', async () => {
  const { data } = await Actions.call(client, {
    account: sourceAccount.address,
    blockNumber,
    data: name4bytes,
    to: address,
  })
  expect(data).toMatch(/7761676d69/)
})

test('args: numberish quantities (number, hex, bigint)', async () => {
  const { data } = await Actions.call(client, {
    account: sourceAccount.address,
    data: name4bytes,
    gas: '0x2dc6c0',
    maxFeePerGas: 100_000_000_000n,
    maxPriorityFeePerGas: 1,
    nonce: 0,
    to: address,
    value: '0x0',
  })
  expect(data).toMatch(/7761676d69/)
})

test('args: from (instead of account)', async () => {
  const { data } = await Actions.call(client, {
    data: name4bytes,
    from: sourceAccount.address,
    to: address,
  })
  expect(data).toMatch(/7761676d69/)
})

test('args: blockHash (EIP-1898)', async () => {
  const block = await Actions.block.get(client, { blockTag: 'latest' })
  const { data } = await Actions.call(client, {
    account: sourceAccount.address,
    blockHash: block.hash!,
    data: name4bytes,
    to: address,
  })
  expect(data).toMatch(/7761676d69/)
})

test('args: blockHash + requireCanonical (EIP-1898)', async () => {
  const block = await Actions.block.get(client, { blockTag: 'latest' })
  const { data } = await Actions.call(client, {
    account: sourceAccount.address,
    blockHash: block.hash!,
    data: name4bytes,
    requireCanonical: true,
    to: address,
  })
  expect(data).toMatch(/7761676d69/)
})

test('args: stateOverride', async () => {
  const fakeName = 'NotWagmi'

  const nameSlot = Hex.fromNumber(0, { size: 32 })
  const fakeNameHex = Hex.fromString(fakeName)
  const bytesLen = fakeNameHex.length - 2
  const slotValue = `${Hex.padRight(fakeNameHex, 31)}${Hex.fromNumber(
    bytesLen,
    { size: 1 },
  ).slice(2)}` as Hex.Hex

  const { data } = await Actions.call(client, {
    data: name4bytes,
    stateOverride: {
      [address]: {
        stateDiff: { [nameSlot]: slotValue },
      },
    },
    to: address,
  })

  expect(data).toBe(AbiParameters.encode([{ type: 'string' }], [fakeName]))
})

test('args: blockOverrides (deployless bytecode)', async () => {
  const { data } = await Actions.call(client, {
    blockOverrides: { time: 420n },
    code: constants.multicall3Bytecode,
    data: getCurrentBlockTimestamp4bytes,
  })
  expect(data).toBe(Hex.fromNumber(420, { size: 32 }))
})

test('account hoisting', async () => {
  const hoistClient = Client.create({
    account: sourceAccount.address,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const { data } = await Actions.call(hoistClient, {
    data: mint4bytes,
    to: address,
  })
  expect(data).toBeUndefined()
})

test('deployless call (bytecode)', async () => {
  const { data } = await Actions.call(client, {
    code: constants.multicall3Bytecode,
    data: getCurrentBlockTimestamp4bytes,
  })
  expect(data).toBeDefined()
})

test('error: pass code and factory', async () => {
  await expect(() =>
    Actions.call(client, {
      code: '0xdeadbeef',
      factory: address,
      factoryData: '0xdeadbeef',
    }),
  ).rejects.toThrowError(
    'Cannot provide both `code` & `factory`/`factoryData` as parameters.',
  )
})

test('error: pass code and to', async () => {
  await expect(() =>
    Actions.call(client, {
      code: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowError('Cannot provide both `code` & `to` as parameters.')
})

test('error: invalid from address', async () => {
  await expect(() =>
    Actions.call(client, {
      account: '0xdeadbeef' as never,
      data: name4bytes,
      to: address,
    }),
  ).rejects.toThrowError()
})

test('error: invalid to address', async () => {
  await expect(() =>
    Actions.call(client, {
      data: name4bytes,
      to: '0xdeadbeef' as never,
    }),
  ).rejects.toThrowError()
})

test('error: aborted request is not wrapped', async () => {
  const controller = new AbortController()
  controller.abort()
  await expect(() =>
    Actions.call(client, {
      data: name4bytes,
      requestOptions: { signal: controller.signal },
      to: address,
    }),
  ).rejects.toThrowError()
})

test('error: failed counterfactual deployment', async () => {
  await expect(() =>
    Actions.call(client, {
      data: '0xdeadbeef',
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowError(CounterfactualDeploymentFailedError)
})

test('batch: multicall', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const [{ data: nameData }, { data: totalSupplyData }] = await Promise.all([
    Actions.call(batchClient, { data: name4bytes, to: address }),
    Actions.call(batchClient, { data: totalSupply4bytes, to: address }),
  ])

  expect(AbiFunction.decodeResult(nameAbi, nameData!)).toBe('wagmi')
  expect(totalSupplyData).toMatch(/^0x/)
})

test('batch: deployless multicall', async () => {
  const batchClient = Client.create({
    batch: { multicall: { deployless: true } },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const [{ data: nameData }] = await Promise.all([
    Actions.call(batchClient, { data: name4bytes, to: address }),
    Actions.call(batchClient, { data: totalSupply4bytes, to: address }),
  ])

  expect(AbiFunction.decodeResult(nameAbi, nameData!)).toBe('wagmi')
})

test('batch: with state override (not on multicall address)', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const { data } = await Actions.call(batchClient, {
    data: name4bytes,
    stateOverride: {
      '0x0000000000000000000000000000000000000000': { balance: 1n },
    },
    to: address,
  })

  expect(AbiFunction.decodeResult(nameAbi, data!)).toBe('wagmi')
})

test('batch: state override on multicall address falls back to direct call', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const { data } = await Actions.call(batchClient, {
    data: name4bytes,
    stateOverride: {
      [multicall3]: { balance: 1n },
    },
    to: address,
  })

  expect(AbiFunction.decodeResult(nameAbi, data!)).toBe('wagmi')
})

test('batch: shared requestOptions', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const requestOptions = {}
  const [{ data: nameData }] = await Promise.all([
    Actions.call(batchClient, {
      data: name4bytes,
      requestOptions,
      to: address,
    }),
    Actions.call(batchClient, {
      data: totalSupply4bytes,
      requestOptions,
      to: address,
    }),
  ])

  expect(AbiFunction.decodeResult(nameAbi, nameData!)).toBe('wagmi')
})

test('batch: no chain uses deployless multicall', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const { data } = await Actions.call(batchClient, {
    data: name4bytes,
    to: address,
  })
  expect(AbiFunction.decodeResult(nameAbi, data!)).toBe('wagmi')
})

test('batch: chain without multicall3 uses deployless multicall', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: { ...mainnet, contracts: {} },
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const [{ data: nameData }] = await Promise.all([
    Actions.call(batchClient, { data: name4bytes, to: address }),
    Actions.call(batchClient, { data: totalSupply4bytes, to: address }),
  ])
  expect(AbiFunction.decodeResult(nameAbi, nameData!)).toBe('wagmi')
})

test('batch: request with extra fields falls back to direct call', async () => {
  const batchClient = Client.create({
    account: sourceAccount.address,
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const { data } = await Actions.call(batchClient, {
    data: name4bytes,
    to: address,
  })
  expect(AbiFunction.decodeResult(nameAbi, data!)).toBe('wagmi')
})

test('batch: sub-call returning empty data', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  // setApprovalForAll(operator, true): returns void (0x) and succeeds for
  // any msg.sender, exercising the empty-return-data multicall branch.
  const setApprovalForAll =
    '0xa22cb465' +
    '0000000000000000000000000000000000000000000000000000000000000001' +
    '0000000000000000000000000000000000000000000000000000000000000001'

  const { data } = await Actions.call(batchClient, {
    data: setApprovalForAll as `0x${string}`,
    to: address,
  })
  expect(data).toBeUndefined()
})

test('batch: sub-call failure throws', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const error = await Actions.call(batchClient, {
    data: '0xdeadbeef',
    to: address,
  }).catch((error) => error)
  expect(error).toBeInstanceOf(RpcError.ExecutionError)
  expect(error.cause).toBeInstanceOf(multicall.MulticallCallFailedError)
})

test('batch: explicit batch option without client batch config', async () => {
  const chainClient = Client.create({
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const { data } = await Actions.call(chainClient, {
    batch: true,
    data: name4bytes,
    to: address,
  })
  expect(AbiFunction.decodeResult(nameAbi, data!)).toBe('wagmi')
})

test('batch: no data falls back to direct call', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  // EOA target with empty calldata returns `0x`.
  const { data } = await Actions.call(batchClient, {
    to: sourceAccount.address,
  })
  expect(data).toBeUndefined()
})

test('batch: with explicit batchSize and wait', async () => {
  const batchClient = Client.create({
    batch: { multicall: { batchSize: 4096, wait: 1 } },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  const [{ data: nameData }] = await Promise.all([
    Actions.call(batchClient, { data: name4bytes, to: address }),
    Actions.call(batchClient, { data: totalSupply4bytes, to: address }),
  ])

  expect(AbiFunction.decodeResult(nameAbi, nameData!)).toBe('wagmi')
})

test('batch: data without target falls back to direct call', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  // contract-creation call (no `to`) is never wrapped in a multicall.
  const { data } = await Actions.call(batchClient, { data: '0x00' })
  expect(data).toBeUndefined()
})

test('batch: aggregate3 selector falls back to direct call', async () => {
  const batchClient = Client.create({
    batch: { multicall: true },
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  // data already targeting `aggregate3` is never re-wrapped in a multicall.
  await expect(() =>
    Actions.call(batchClient, {
      data: '0x82ad56cb',
      to: address,
    }),
  ).rejects.toThrowError()
})

test('args: stateOverride + blockOverrides', async () => {
  const { data } = await Actions.call(client, {
    blockOverrides: { time: 420n },
    data: name4bytes,
    stateOverride: {
      '0x0000000000000000000000000000000000000000': { balance: 1n },
    },
    to: address,
  })
  expect(AbiFunction.decodeResult(nameAbi, data!)).toBe('wagmi')
})

describe('errors', () => {
  // `ownerOf` of a nonexistent token reverts.
  const ownerOfAbi = AbiFunction.from(
    'function ownerOf(uint256 tokenId) returns (address)',
  )
  const ownerOfNonexistent = AbiFunction.encodeData(ownerOfAbi, [12517631n])

  test('execution reverted maps to RpcError.ExecutionError', async () => {
    const error = await Actions.call(client, {
      account: sourceAccount.address,
      data: ownerOfNonexistent,
      to: address,
    }).catch((error) => error)

    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.cause).toBeInstanceOf(RpcError.ExecutionRevertedError)
    expect(error.cause.name).toBe('RpcError.ExecutionRevertedError')
  })

  test('error renders raw call arguments', async () => {
    const error = await Actions.call(client, {
      account: sourceAccount.address,
      data: ownerOfNonexistent,
      to: address,
    }).catch((error) => error)

    expect(error.metaMessages?.join('\n')).toContain('Request Arguments:')
    expect(error.metaMessages?.join('\n')).toContain(address)
    expect(error.metaMessages?.join('\n')).toContain(sourceAccount.address)
  })

  test('deployless (no `to`) revert maps to RpcError.ExecutionError', async () => {
    // Runtime bytecode that immediately reverts; `to` is undefined.
    const error = await Actions.call(client, {
      code: '0x60006000fd',
      data: '0xdeadbeef',
    }).catch((error) => error)

    expect(error).toBeInstanceOf(RpcError.ExecutionError)
    expect(error.metaMessages?.join('\n')).not.toContain('to:')
  })
})

describe('RpcError.ExecutionError', () => {
  test('renders fees, value and raw args', () => {
    const error = new RpcError.ExecutionError(
      new Errors.BaseError('reverted'),
      {
        chain: mainnet,
        data: '0xdeadbeef',
        from: '0x0000000000000000000000000000000000000000',
        gas: 21000n,
        gasPrice: 2000000000n,
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
        gasPrice:              2 gwei
        maxFeePerGas:          3 gwei
        maxPriorityFeePerGas:  1 gwei
        nonce:                 1
        to:                    0x1111111111111111111111111111111111111111
        value:                 1 ETH

      Details: reverted
      Version: viem@2.52.1"
    `)
  })

  test('renders nested request fields (state override, access list)', () => {
    const error = new RpcError.ExecutionError(
      new Errors.BaseError('reverted'),
      {
        accessList: [
          {
            address: '0x3333333333333333333333333333333333333333',
            storageKeys: [
              '0x0000000000000000000000000000000000000000000000000000000000000001',
            ],
          },
        ],
        data: '0xdeadbeef',
        to: '0x1111111111111111111111111111111111111111',
        stateOverride: {
          '0x2222222222222222222222222222222222222222': {
            balance: 1n,
            nonce: 2n,
            stateDiff: {
              '0x0000000000000000000000000000000000000000000000000000000000000001':
                '0x0000000000000000000000000000000000000000000000000000000000000002',
            },
          },
        },
      },
    )
    expect(error.message).toMatchInlineSnapshot(`
      "reverted

      Request Arguments:
        accessList:
          - address:      0x3333333333333333333333333333333333333333
            storageKeys:
              - 0x0000000000000000000000000000000000000000000000000000000000000001
        data:           0xdeadbeef
        to:             0x1111111111111111111111111111111111111111
        stateOverride:
          0x2222222222222222222222222222222222222222:
            balance:    1
            nonce:      2
            stateDiff:
              0x0000000000000000000000000000000000000000000000000000000000000001:  0x0000000000000000000000000000000000000000000000000000000000000002

      Details: reverted
      Version: viem@2.52.1"
    `)
  })

  test('forwards cause metaMessages', () => {
    const cause = new Errors.BaseError('reverted', {
      metaMessages: ['meta line'],
    })
    const error = new RpcError.ExecutionError(cause, {
      data: '0xdeadbeef',
      to: '0x1111111111111111111111111111111111111111',
    })
    expect(error.metaMessages?.join('\n')).toContain('meta line')
    expect(error.metaMessages?.join('\n')).toContain('Request Arguments:')
  })

  test('plain Error cause falls back to message', () => {
    const error = new RpcError.ExecutionError(new Error(''), {})
    expect(error.message).toContain('An error occurred.')
  })

  test('uses ETH symbol when chain omitted', () => {
    const error = new RpcError.ExecutionError(
      new Errors.BaseError('reverted'),
      {
        value: 1000000000000000000n,
      },
    )
    expect(error.metaMessages?.join('\n')).toContain('1 ETH')
  })
})

describe('CounterfactualDeploymentFailedError', () => {
  test('with factory', () => {
    expect(
      new CounterfactualDeploymentFailedError({
        factory: '0x0000000000000000000000000000000000000000',
      }).metaMessages,
    ).toBeDefined()
  })

  test('without factory', () => {
    expect(
      new CounterfactualDeploymentFailedError({}).metaMessages,
    ).toBeUndefined()
  })
})

describe('getRevertErrorData', () => {
  test('default', () => {
    expect(getRevertErrorData(new Error('lol'))).toBe(undefined)
    expect(getRevertErrorData(new Errors.BaseError('lol'))).toBe(undefined)
    expect(
      getRevertErrorData(
        new Errors.BaseError('error', {
          cause: Object.assign(new Error('inner'), { data: '0xdeadbeef' }),
        }),
      ),
    ).toBe('0xdeadbeef')
    expect(
      getRevertErrorData(
        new Errors.BaseError('error', {
          cause: Object.assign(new Error('inner'), {
            data: { data: '0x556f1830' },
          }),
        }),
      ),
    ).toBe('0x556f1830')
  })
})
