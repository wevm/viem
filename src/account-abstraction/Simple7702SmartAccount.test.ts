import { Abi, AbiFunction, Address } from 'ox'
import type { Address as AddressType } from 'ox'
import { beforeAll, describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem'
import * as anvil from '~test/anvil.js'
import { deploySimple7702Account08 } from '~test/account-abstraction.js'
import * as constants from '~test/constants.js'
import * as EntryPoint from './EntryPoint.js'
import * as Simple7702SmartAccount from './Simple7702SmartAccount.js'

const client = anvil.getClient(anvil.mainnet)
const owner = Account.fromPrivateKey(constants.accounts[1].privateKey)

let implementation: AddressType.Address
beforeAll(async () => {
  const result = await deploySimple7702Account08(client)
  implementation = result.implementationAddress
})

test('default', async () => {
  const account = await Simple7702SmartAccount.from({ client, owner })

  expect({
    ...account,
    abi: null,
    authorization: { ...account.authorization, account: null },
    client: null,
    entryPoint: null,
    owner: null,
  }).toMatchInlineSnapshot(`
    {
      "abi": null,
      "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "authorization": {
        "account": null,
        "address": "0xe6Cae83BdE06E4c305530e199D7217f42808555B",
      },
      "client": null,
      "decodeCalls": [Function],
      "encodeCalls": [Function],
      "entryPoint": null,
      "getAddress": [Function],
      "getFactoryArgs": [Function],
      "getNonce": [Function],
      "getStubSignature": [Function],
      "isDeployed": [Function],
      "owner": null,
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
    }
  `)
})

test('args: implementation', async () => {
  const account = await Simple7702SmartAccount.from({
    client,
    implementation,
    owner,
  })

  expect(
    Address.isEqual(account.authorization.address, implementation),
  ).toMatchInlineSnapshot(`true`)
})

test('args: EntryPoint 0.9', async () => {
  const account = await Simple7702SmartAccount.from({
    client,
    entryPoint: '0.9',
    owner,
  })

  expect(account.entryPoint).toEqual({
    abi: EntryPoint.abiV09,
    address: EntryPoint.addressV09,
    version: '0.9',
  })
  expect(account.authorization.address).toBe(
    '0xa46cc63eBF4Bd77888AA327837d20b23A63a56B5',
  )
})

test('args: custom EntryPoint', async () => {
  const entryPoint = {
    abi: [] as const,
    address: '0x0000000000000000000000000000000000000001',
    version: '0.9',
  } as const
  const account = await Simple7702SmartAccount.from({
    client,
    entryPoint,
    owner,
  })

  expect(account.entryPoint).toBe(entryPoint)
})

test('abi', async () => {
  const account = await Simple7702SmartAccount.from({ client, owner })

  expect(Abi.format(account.abi)).toMatchInlineSnapshot(`
    [
      "error ECDSAInvalidSignature()",
      "error ECDSAInvalidSignatureLength(uint256 length)",
      "error ECDSAInvalidSignatureS(bytes32 s)",
      "error ExecuteError(uint256 index, bytes error)",
      "fallback() external payable",
      "function entryPoint() pure returns (address)",
      "function execute(address target, uint256 value, bytes data)",
      "function executeBatch((address target, uint256 value, bytes data)[] calls)",
      "function getNonce() view returns (uint256)",
      "function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4 magicValue)",
      "function onERC1155BatchReceived(address, address, uint256[], uint256[], bytes) returns (bytes4)",
      "function onERC1155Received(address, address, uint256, uint256, bytes) returns (bytes4)",
      "function onERC721Received(address, address, uint256, bytes) returns (bytes4)",
      "function supportsInterface(bytes4 id) pure returns (bool)",
      "function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) returns (uint256 validationData)",
      "receive() external payable",
    ]
  `)
})

describe('getAddress', () => {
  test('default', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })

    expect(await account.getAddress()).toMatchInlineSnapshot(
      `"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"`,
    )
  })
})

describe('encodeCalls', () => {
  test('single', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })

    expect(
      await Promise.all([
        account.encodeCalls([
          { to: '0x0000000000000000000000000000000000000000' },
        ]),
        account.encodeCalls([
          {
            to: '0x0000000000000000000000000000000000000000',
            value: 69n,
          },
        ]),
        account.encodeCalls([
          {
            data: '0xdeadbeef',
            to: '0x0000000000000000000000000000000000000000',
            value: 69n,
          },
        ]),
      ]),
    ).toMatchInlineSnapshot(`
      [
        "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000",
      ]
    `)
  })

  test('batch', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })

    expect(
      await account.encodeCalls([
        { to: '0x0000000000000000000000000000000000000000' },
        {
          to: '0x0000000000000000000000000000000000000000',
          value: 69n,
        },
        {
          data: '0xdeadbeef',
          to: '0x0000000000000000000000000000000000000000',
          value: 69n,
        },
      ]),
    ).toMatchInlineSnapshot(
      `"0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000"`,
    )
  })
})

describe('decodeCalls', () => {
  test('single', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })
    const calls = [
      {
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
      },
    ] as const
    const decodeCalls = account.decodeCalls
    if (!decodeCalls) throw new Error('decodeCalls is required.')

    expect(await decodeCalls(await account.encodeCalls(calls))).toEqual(calls)
  })

  test('batch', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })
    const calls = [
      {
        data: '0x',
        to: '0x0000000000000000000000000000000000000000',
        value: 0n,
      },
      {
        data: '0x',
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
      },
      {
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
      },
    ] as const
    const decodeCalls = account.decodeCalls
    if (!decodeCalls) throw new Error('decodeCalls is required.')

    expect(await decodeCalls(await account.encodeCalls(calls))).toEqual(calls)
  })

  test('empty batch', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })
    const decodeCalls = account.decodeCalls
    if (!decodeCalls) throw new Error('decodeCalls is required.')

    expect(
      await decodeCalls(await account.encodeCalls([])),
    ).toMatchInlineSnapshot(`[]`)
  })

  test('error: unsupported function', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })
    const decodeCalls = account.decodeCalls
    if (!decodeCalls) throw new Error('decodeCalls is required.')

    expect(() =>
      decodeCalls(AbiFunction.encodeData(account.abi, 'entryPoint')),
    ).toThrowErrorMatchingInlineSnapshot(
      `[BaseError: unable to decode calls for "entryPoint"]`,
    )
  })
})

describe('getFactoryArgs', () => {
  test('undeployed', async () => {
    const undeployedOwner = Account.fromPrivateKey(
      '0x0000000000000000000000000000000000000000000000000000000000000011',
    )
    const account = await Simple7702SmartAccount.from({
      client,
      implementation,
      owner: undeployedOwner,
    })

    expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
      {
        "factory": undefined,
        "factoryData": undefined,
      }
    `)
  })
})

describe('getStubSignature', () => {
  test('default', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })

    expect(await account.getStubSignature()).toMatchInlineSnapshot(
      `"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"`,
    )
  })
})

describe('getNonce', () => {
  test('default', async () => {
    const nonceOwner = Account.fromPrivateKey(
      '0x0000000000000000000000000000000000000000000000000000000000000012',
    )
    const account = await Simple7702SmartAccount.from({
      client,
      implementation,
      owner: nonceOwner,
    })

    expect(await account.getNonce({ key: 0n })).toMatchInlineSnapshot(`0n`)
    expect((await account.getNonce()) > 0n).toMatchInlineSnapshot(`true`)
  })

  test('args: getNonce', async () => {
    const account = await Simple7702SmartAccount.from({
      client,
      getNonce(options = {}) {
        return (options.key ?? 0n) + 1n
      },
      implementation,
      owner,
    })

    expect(await account.getNonce({ key: 41n })).toMatchInlineSnapshot(`42n`)
  })
})

test('EIP-7702 authorization and owner signatures', async () => {
  const delegatedOwner = Account.fromPrivateKey(
    '0x0000000000000000000000000000000000000000000000000000000000000013',
  )
  const sponsor = Account.fromPrivateKey(constants.accounts[0].privateKey)
  const account = await Simple7702SmartAccount.from({
    client,
    implementation,
    owner: delegatedOwner,
  })
  const authorization = await Actions.wallet.signAuthorization(client, {
    account: account.authorization.account,
    address: account.authorization.address,
  })

  await Actions.transaction.send(client, {
    account: sponsor,
    authorizationList: [authorization],
    to: sponsor.address,
  })
  await Actions.test.block.mine(client, { blocks: 1 })

  expect(await account.isDeployed()).toMatchInlineSnapshot(`true`)
  expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
    {
      "factory": undefined,
      "factoryData": undefined,
    }
  `)
  expect(
    await Actions.contract.read(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'entryPoint',
    }),
  ).toBe(EntryPoint.addressV08)

  const message = 'hello world'
  expect(
    await Actions.verifyMessage(client, {
      address: account.address,
      message,
      signature: await account.signMessage({ message }),
    }),
  ).toMatchInlineSnapshot(`true`)

  const typedData = {
    ...constants.typedData.basic,
    primaryType: 'Mail',
  } as const
  expect(
    await Actions.verifyTypedData(client, {
      address: account.address,
      signature: await account.signTypedData(typedData),
      ...typedData,
    }),
  ).toMatchInlineSnapshot(`true`)
})

describe('signUserOperation', () => {
  test('default', async () => {
    const account = await Simple7702SmartAccount.from({ client, owner })

    expect(
      await account.signUserOperation({
        callData: '0xdeadbeef',
        callGasLimit: 69n,
        maxFeePerGas: 69n,
        maxPriorityFeePerGas: 69n,
        nonce: 0n,
        preVerificationGas: 69n,
        signature: '0xdeadbeef',
        verificationGasLimit: 69n,
      }),
    ).toMatchInlineSnapshot(
      `"0xf29d9b44ec09b8542328c9f75a6e36976ac3507b43fa2d86f06b5157e60db7207bafccde8e7a308019dce8b540642e6134a5aebd69bfacb1778928c7f7c774711c"`,
    )
  })
})
