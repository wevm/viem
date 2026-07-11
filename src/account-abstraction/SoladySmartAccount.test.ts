import { Abi, AbiFunction, Address, Hex } from 'ox'
import { EntryPoint, UserOperation } from 'ox/erc4337'
import { beforeAll, describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem'
import * as accountAbstraction from '~test/account-abstraction.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as SoladySmartAccount from './SoladySmartAccount.js'

const client = anvil.getClient(anvil.mainnet)
const owner = Account.fromPrivateKey(constants.accounts[1].privateKey)

let factoryAddress06: Address.Address
let factoryAddress07: Address.Address
beforeAll(async () => {
  const result06 = await accountAbstraction.deploySoladyAccount06(client)
  const result07 = await accountAbstraction.deploySoladyAccount07(client)
  factoryAddress06 = result06.factoryAddress
  factoryAddress07 = result07.factoryAddress
})

test('default', async () => {
  const account = await SoladySmartAccount.from({
    address: '0x0000000000000000000000000000000000000001',
    client,
    owner,
  })

  expect({
    ...account,
    abi: null,
    client: null,
    entryPoint: { ...account.entryPoint, abi: null },
    factory: { ...account.factory, abi: null },
  }).toMatchInlineSnapshot(`
    {
      "abi": null,
      "address": "0x0000000000000000000000000000000000000001",
      "client": null,
      "decodeCalls": [Function],
      "encodeCalls": [Function],
      "entryPoint": {
        "abi": null,
        "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "version": "0.7",
      },
      "factory": {
        "abi": null,
        "address": "0x5d82735936c6Cd5DE57cC3c1A799f6B2E6F933Df",
      },
      "getAddress": [Function],
      "getFactoryArgs": [Function],
      "getNonce": [Function],
      "getStubSignature": [Function],
      "isDeployed": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
    }
  `)
})

test('error: explicit EntryPoint 0.6 requires a factory', async () => {
  const entryPoint = {
    abi: EntryPoint.abiV06,
    address: EntryPoint.addressV06,
    version: '0.6',
  } as const

  await expect(
    // @ts-expect-error Explicit EntryPoints require a compatible factory.
    SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000006',
      client,
      entryPoint,
      owner,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[BaseError: \`factoryAddress\` is required when \`entryPoint\` is provided.]`,
  )
})

test('error: explicit EntryPoint 0.7 requires a factory', async () => {
  const entryPoint = {
    abi: EntryPoint.abiV07,
    address: EntryPoint.addressV07,
    version: '0.7',
  } as const

  await expect(
    // @ts-expect-error Explicit EntryPoints require a compatible factory.
    SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000007',
      client,
      entryPoint,
      owner,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[BaseError: \`factoryAddress\` is required when \`entryPoint\` is provided.]`,
  )
})

test('abis', async () => {
  const [account06, account07] = await Promise.all([
    SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000006',
      client,
      entryPoint: {
        abi: EntryPoint.abiV06,
        address: EntryPoint.addressV06,
        version: '0.6',
      },
      factoryAddress: '0x0000000000000000000000000000000000001006',
      owner,
    }),
    SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000007',
      client,
      entryPoint: {
        abi: EntryPoint.abiV07,
        address: EntryPoint.addressV07,
        version: '0.7',
      },
      factoryAddress: '0x0000000000000000000000000000000000001007',
      owner,
    }),
  ])

  expect({
    account06: Abi.format(account06.abi),
    account07: Abi.format(account07.abi),
    factory: Abi.format(account07.factory.abi),
  }).toMatchInlineSnapshot(`
    {
      "account06": [
        "fallback() external payable",
        "receive() external payable",
        "function addDeposit() payable",
        "function cancelOwnershipHandover() payable",
        "function completeOwnershipHandover(address pendingOwner) payable",
        "function delegateExecute(address delegate, bytes data) payable returns (bytes result)",
        "function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)",
        "function entryPoint() view returns (address)",
        "function execute(address target, uint256 value, bytes data) payable returns (bytes result)",
        "function executeBatch((address target, uint256 value, bytes data)[] calls) payable returns (bytes[] results)",
        "function getDeposit() view returns (uint256 result)",
        "function initialize(address newOwner) payable",
        "function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4 result)",
        "function owner() view returns (address result)",
        "function ownershipHandoverExpiresAt(address pendingOwner) view returns (uint256 result)",
        "function proxiableUUID() view returns (bytes32)",
        "function renounceOwnership() payable",
        "function requestOwnershipHandover() payable",
        "function storageLoad(bytes32 storageSlot) view returns (bytes32 result)",
        "function storageStore(bytes32 storageSlot, bytes32 storageValue) payable",
        "function transferOwnership(address newOwner) payable",
        "function upgradeToAndCall(address newImplementation, bytes data) payable",
        "function withdrawDepositTo(address to, uint256 amount) payable",
        "event OwnershipHandoverCanceled(address indexed pendingOwner)",
        "event OwnershipHandoverRequested(address indexed pendingOwner)",
        "event OwnershipTransferred(address indexed oldOwner, address indexed newOwner)",
        "event Upgraded(address indexed implementation)",
        "error AlreadyInitialized()",
        "error NewOwnerIsZeroAddress()",
        "error NoHandoverRequest()",
        "error Unauthorized()",
        "error UnauthorizedCallContext()",
        "error UpgradeFailed()",
        "function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) payable returns (uint256 validationData)",
      ],
      "account07": [
        "fallback() external payable",
        "receive() external payable",
        "function addDeposit() payable",
        "function cancelOwnershipHandover() payable",
        "function completeOwnershipHandover(address pendingOwner) payable",
        "function delegateExecute(address delegate, bytes data) payable returns (bytes result)",
        "function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)",
        "function entryPoint() view returns (address)",
        "function execute(address target, uint256 value, bytes data) payable returns (bytes result)",
        "function executeBatch((address target, uint256 value, bytes data)[] calls) payable returns (bytes[] results)",
        "function getDeposit() view returns (uint256 result)",
        "function initialize(address newOwner) payable",
        "function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4 result)",
        "function owner() view returns (address result)",
        "function ownershipHandoverExpiresAt(address pendingOwner) view returns (uint256 result)",
        "function proxiableUUID() view returns (bytes32)",
        "function renounceOwnership() payable",
        "function requestOwnershipHandover() payable",
        "function storageLoad(bytes32 storageSlot) view returns (bytes32 result)",
        "function storageStore(bytes32 storageSlot, bytes32 storageValue) payable",
        "function transferOwnership(address newOwner) payable",
        "function upgradeToAndCall(address newImplementation, bytes data) payable",
        "function withdrawDepositTo(address to, uint256 amount) payable",
        "event OwnershipHandoverCanceled(address indexed pendingOwner)",
        "event OwnershipHandoverRequested(address indexed pendingOwner)",
        "event OwnershipTransferred(address indexed oldOwner, address indexed newOwner)",
        "event Upgraded(address indexed implementation)",
        "error AlreadyInitialized()",
        "error NewOwnerIsZeroAddress()",
        "error NoHandoverRequest()",
        "error Unauthorized()",
        "error UnauthorizedCallContext()",
        "error UpgradeFailed()",
        "function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) payable returns (uint256 validationData)",
        "error FnSelectorNotRecognized()",
      ],
      "factory": [
        "constructor(address erc4337)",
        "function createAccount(address owner, bytes32 salt) payable returns (address)",
        "function getAddress(bytes32 salt) view returns (address)",
        "function implementation() view returns (address)",
        "function initCodeHash() view returns (bytes32)",
      ],
    }
  `)
})

describe('encodeCalls', () => {
  test('single', async () => {
    const account = await SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000011',
      client,
      owner,
    })

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
    const account = await SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000012',
      client,
      owner,
    })

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
  test('single, batch, and empty batch', async () => {
    const account = await SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000021',
      client,
      owner,
    })
    const single = [
      {
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
      },
    ] as const
    const batch = [
      {
        data: '0x',
        to: '0x0000000000000000000000000000000000000000',
        value: 0n,
      },
      ...single,
    ] as const

    expect(
      await Promise.all([
        account.decodeCalls(await account.encodeCalls(single)),
        account.decodeCalls(await account.encodeCalls(batch)),
        account.decodeCalls(await account.encodeCalls([])),
      ]),
    ).toEqual([single, batch, []])
  })

  test('error: unsupported function', async () => {
    const account = await SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000022',
      client,
      owner,
    })

    expect(() =>
      account.decodeCalls(AbiFunction.encodeData(account.abi, 'entryPoint')),
    ).toThrowErrorMatchingInlineSnapshot(
      `[BaseError: Unable to decode calls for "entryPoint".]`,
    )
  })
})

describe('address and factory args', () => {
  test('salt, factory, and address overrides', async () => {
    const [account1, account2, overridden] = await Promise.all([
      SoladySmartAccount.from({
        client,
        factoryAddress: factoryAddress07,
        owner,
        salt: '0x1',
      }),
      SoladySmartAccount.from({
        client,
        factoryAddress: factoryAddress07,
        owner,
        salt: '0x2',
      }),
      SoladySmartAccount.from({
        address: '0x0000000000000000000000000000000000001234',
        client,
        factoryAddress: '0x0000000000000000000000000000000000005678',
        owner,
        salt: '0x3',
      }),
    ])
    const [factoryArgs1, factoryArgs2] = await Promise.all([
      account1.getFactoryArgs(),
      account2.getFactoryArgs(),
    ])

    expect({
      addressOverride: overridden.address,
      factoryData1: factoryArgs1.factoryData,
      factoryData2: factoryArgs2.factoryData,
      factoryOverride: overridden.factory.address,
      saltsDiffer: !Address.isEqual(account1.address, account2.address),
    }).toMatchInlineSnapshot(`
      {
        "addressOverride": "0x0000000000000000000000000000000000001234",
        "factoryData1": "0xf14ddffc00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000001",
        "factoryData2": "0xf14ddffc00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000002",
        "factoryOverride": "0x0000000000000000000000000000000000005678",
        "saltsDiffer": true,
      }
    `)
  })

  test('real 0.6 and 0.7 deployments', async () => {
    const salt06 = '0x6006'
    const salt07 = '0x7007'
    const [account06, account07] = await Promise.all([
      SoladySmartAccount.from({
        client,
        entryPoint: {
          abi: EntryPoint.abiV06,
          address: EntryPoint.addressV06,
          version: '0.6',
        },
        factoryAddress: factoryAddress06,
        owner,
        salt: salt06,
      }),
      SoladySmartAccount.from({
        client,
        entryPoint: {
          abi: EntryPoint.abiV07,
          address: EntryPoint.addressV07,
          version: '0.7',
        },
        factoryAddress: factoryAddress07,
        owner,
        salt: salt07,
      }),
    ])

    await Actions.contract.write(client, {
      ...account06.factory,
      account: owner,
      args: [owner.address, Hex.padLeft(salt06)],
      functionName: 'createAccount',
    })
    await Actions.test.block.mine(client, { blocks: 1 })
    await Actions.contract.write(client, {
      ...account07.factory,
      account: owner,
      args: [owner.address, Hex.padLeft(salt07)],
      functionName: 'createAccount',
    })
    await Actions.test.block.mine(client, { blocks: 1 })

    expect({
      account06: {
        deployed: await account06.isDeployed(),
        entryPoint: await Actions.contract.read(client, {
          abi: account06.abi,
          address: account06.address,
          functionName: 'entryPoint',
        }),
        factoryArgs: await account06.getFactoryArgs(),
        nonce: await account06.getNonce({ key: 0n }),
        owner: await Actions.contract.read(client, {
          abi: account06.abi,
          address: account06.address,
          functionName: 'owner',
        }),
      },
      account07: {
        deployed: await account07.isDeployed(),
        entryPoint: await Actions.contract.read(client, {
          abi: account07.abi,
          address: account07.address,
          functionName: 'entryPoint',
        }),
        factoryArgs: await account07.getFactoryArgs(),
        nonce: await account07.getNonce({ key: 0n }),
        owner: await Actions.contract.read(client, {
          abi: account07.abi,
          address: account07.address,
          functionName: 'owner',
        }),
      },
    }).toMatchInlineSnapshot(`
      {
        "account06": {
          "deployed": true,
          "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
          "factoryArgs": {
            "factory": undefined,
            "factoryData": undefined,
          },
          "nonce": 0n,
          "owner": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        },
        "account07": {
          "deployed": true,
          "entryPoint": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
          "factoryArgs": {
            "factory": undefined,
            "factoryData": undefined,
          },
          "nonce": 0n,
          "owner": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        },
      }
    `)
  })
})

describe('getNonce', () => {
  test('override', async () => {
    const account = await SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000031',
      client,
      getNonce(options = {}) {
        return (options.key ?? 0n) + 1n
      },
      owner,
    })

    expect(await account.getNonce({ key: 41n })).toMatchInlineSnapshot(`42n`)
  })
})

describe('getStubSignature', () => {
  test('default', async () => {
    const account = await SoladySmartAccount.from({
      address: '0x0000000000000000000000000000000000000041',
      client,
      owner,
    })

    expect(await account.getStubSignature()).toMatchInlineSnapshot(
      `"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"`,
    )
  })
})

describe('message signing', () => {
  test('signMessage: deployed verification', async () => {
    const salt = '0x773901'
    const account = await SoladySmartAccount.from({
      client,
      factoryAddress: factoryAddress07,
      owner: owner.address,
      salt,
    })
    await Actions.contract.write(client, {
      ...account.factory,
      account: owner,
      args: [owner.address, Hex.padLeft(salt)],
      functionName: 'createAccount',
    })
    await Actions.test.block.mine(client, { blocks: 1 })

    const messages = [
      'hello world',
      { raw: '0x68656c6c6f20776f726c64' },
      { raw: Hex.toBytes('0x68656c6c6f20776f726c64') },
    ] as const
    expect(
      await Promise.all(
        messages.map(async (message) => {
          const signature = await account.signMessage({ message })
          return Actions.verifyMessage(client, {
            address: account.address,
            message,
            signature,
          })
        }),
      ),
    ).toMatchInlineSnapshot(`
      [
        true,
        true,
        true,
      ]
    `)
  })

  test('signMessage: counterfactual verification', async () => {
    const account = await SoladySmartAccount.from({
      client,
      factoryAddress: factoryAddress07,
      owner: constants.accounts[9].address,
      salt: '0x773902',
    })
    const message = 'hello world'
    const signature = await account.signMessage({ message })

    expect(
      await Actions.verifyMessage(client, {
        address: account.address,
        message,
        signature,
      }),
    ).toMatchInlineSnapshot(`true`)
  })

  test('signTypedData: deployed verification', async () => {
    const salt = '0x773903'
    const account = await SoladySmartAccount.from({
      client,
      factoryAddress: factoryAddress07,
      owner,
      salt,
    })
    await Actions.contract.write(client, {
      ...account.factory,
      account: owner,
      args: [owner.address, Hex.padLeft(salt)],
      functionName: 'createAccount',
    })
    await Actions.test.block.mine(client, { blocks: 1 })

    const value = {
      ...constants.typedData.basic,
      primaryType: 'Mail',
    } as const
    const signature = await account.signTypedData(value)

    expect(
      await Actions.verifyTypedData(client, {
        ...value,
        address: account.address,
        signature,
      }),
    ).toMatchInlineSnapshot(`true`)
  })

  test('signTypedData: counterfactual verification', async () => {
    const account = await SoladySmartAccount.from({
      client,
      factoryAddress: factoryAddress07,
      owner: constants.accounts[9].address,
      salt: '0x773904',
    })
    const value = {
      ...constants.typedData.basic,
      primaryType: 'Mail',
    } as const
    const signature = await account.signTypedData(value)

    expect(
      await Actions.verifyTypedData(client, {
        ...value,
        address: account.address,
        signature,
      }),
    ).toMatchInlineSnapshot(`true`)
  })
})

describe('signUserOperation', () => {
  const userOperation = {
    callData: '0xdeadbeef',
    callGasLimit: 69n,
    maxFeePerGas: 69n,
    maxPriorityFeePerGas: 69n,
    nonce: 0n,
    preVerificationGas: 69n,
    signature: '0xdeadbeef',
    verificationGasLimit: 69n,
  } as const

  test('EntryPoint 0.6 and 0.7 local owners', async () => {
    const [account06, account07] = await Promise.all([
      SoladySmartAccount.from({
        client,
        entryPoint: {
          abi: EntryPoint.abiV06,
          address: EntryPoint.addressV06,
          version: '0.6',
        },
        factoryAddress: factoryAddress06,
        owner,
        salt: '0x6060',
      }),
      SoladySmartAccount.from({
        client,
        entryPoint: {
          abi: EntryPoint.abiV07,
          address: EntryPoint.addressV07,
          version: '0.7',
        },
        factoryAddress: factoryAddress07,
        owner,
        salt: '0x7070',
      }),
    ])
    const payload06 = UserOperation.getSignPayload(
      { ...userOperation, sender: account06.address },
      {
        chainId: 1,
        entryPointAddress: EntryPoint.addressV06,
        entryPointVersion: '0.6',
      },
    )
    const payload07 = UserOperation.getSignPayload(
      { ...userOperation, sender: account07.address },
      {
        chainId: 5,
        entryPointAddress: EntryPoint.addressV07,
        entryPointVersion: '0.7',
      },
    )
    const [signature06, signature07] = await Promise.all([
      account06.signUserOperation(userOperation),
      account07.signUserOperation({ ...userOperation, chainId: 5 }),
    ])

    expect({
      account06: await Actions.verifyMessage(client, {
        address: owner.address,
        message: { raw: payload06 },
        signature: signature06,
      }),
      account07: await Actions.verifyMessage(client, {
        address: owner.address,
        message: { raw: payload07 },
        signature: signature07,
      }),
    }).toMatchInlineSnapshot(`
      {
        "account06": true,
        "account07": true,
      }
    `)
  })

  test('JSON-RPC owner', async () => {
    const walletClient = anvil.getWalletClient(anvil.mainnet)
    const address = '0x0000000000000000000000000000000000000061'
    const account = await SoladySmartAccount.from({
      address,
      client: walletClient,
      owner: constants.accounts[1].address,
    })
    const signature = await account.signUserOperation(userOperation)
    const payload = UserOperation.getSignPayload(
      { ...userOperation, sender: address },
      {
        chainId: 1,
        entryPointAddress: EntryPoint.addressV07,
        entryPointVersion: '0.7',
      },
    )

    expect(
      await Actions.verifyMessage(client, {
        address: constants.accounts[1].address,
        message: { raw: payload },
        signature,
      }),
    ).toMatchInlineSnapshot(`true`)
  })
})
