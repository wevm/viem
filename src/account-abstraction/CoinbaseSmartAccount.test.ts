import {
  Abi,
  AbiFunction,
  AbiParameters,
  Bytes,
  Hex,
  P256,
  Signature,
  Value,
  WebAuthnP256,
} from 'ox'
import { EntryPoint, UserOperation } from 'ox/erc4337'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem'
import {
  Actions as AccountAbstractionActions,
  Client as AccountAbstractionClient,
  http,
} from 'viem/account-abstraction'
import * as anvil from '~test/anvil.js'
import { bundler } from '~test/bundler.js'
import * as constants from '~test/constants.js'
import * as CoinbaseSmartAccount from './CoinbaseSmartAccount.js'
import * as WebAuthnAccount from './WebAuthnAccount.js'

const client = anvil.getClient(anvil.mainnet)
const owner = Account.fromPrivateKey(constants.accounts[0].privateKey)
const owner2 = Account.fromPrivateKey(constants.accounts[1].privateKey)

const webAuthnPrivateKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const webAuthnPublicKey = P256.getPublicKey({
  privateKey: webAuthnPrivateKey,
})
type GetFn = NonNullable<WebAuthnAccount.from.Options['getFn']>
const getFn: GetFn = async (options) => {
  if (!options?.publicKey) throw new Error('Public key options are required.')
  const source = options.publicKey.challenge
  const bytes =
    source instanceof ArrayBuffer
      ? new Uint8Array(source)
      : new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
  const challenge = Hex.fromBytes(bytes)
  const rpId = options.publicKey.rpId ?? 'localhost'
  const { metadata, payload } = WebAuthnP256.getSignPayload({
    challenge,
    origin: `https://${rpId}`,
    rpId,
  })
  const signature = P256.sign({
    hash: true,
    payload,
    privateKey: webAuthnPrivateKey,
  })
  return {
    id: 'test-credential',
    response: {
      authenticatorData: Bytes.fromHex(metadata.authenticatorData)
        .buffer as ArrayBuffer,
      clientDataJSON: Bytes.fromString(metadata.clientDataJSON)
        .buffer as ArrayBuffer,
      signature: Signature.toDerBytes(signature).buffer as ArrayBuffer,
    },
    type: 'public-key',
  } as unknown as WebAuthnP256.Credential
}
const webAuthnOwner = WebAuthnAccount.from(
  { id: 'test-credential', publicKey: webAuthnPublicKey },
  { getFn, rpId: 'example.com' },
)

test('default', async () => {
  const account = await CoinbaseSmartAccount.from({
    client,
    owners: [owner],
    version: '1',
  })

  expect({
    ...account,
    abi: null,
    client: null,
    entryPoint: null,
    factory: { ...account.factory, abi: null },
  }).toMatchInlineSnapshot(`
    {
      "abi": null,
      "address": "0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8",
      "client": null,
      "decodeCalls": [Function],
      "encodeCalls": [Function],
      "entryPoint": null,
      "factory": {
        "abi": null,
        "address": "0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a",
      },
      "getAddress": [Function],
      "getFactoryArgs": [Function],
      "getNonce": [Function],
      "getStubSignature": [Function],
      "isDeployed": [Function],
      "sign": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
      "userOperation": {
        "estimateGas": [Function],
      },
    }
  `)
})

test('abi', async () => {
  const account = await CoinbaseSmartAccount.from({
    client,
    owners: [owner],
    version: '1',
  })

  expect(Abi.format(account.abi)).toMatchInlineSnapshot(`
    [
      "constructor()",
      "error AlreadyOwner(bytes owner)",
      "error Initialized()",
      "error InvalidEthereumAddressOwner(bytes owner)",
      "error InvalidNonceKey(uint256 key)",
      "error InvalidOwnerBytesLength(bytes owner)",
      "error LastOwner()",
      "error NoOwnerAtIndex(uint256 index)",
      "error NotLastOwner(uint256 ownersRemaining)",
      "error SelectorNotAllowed(bytes4 selector)",
      "error Unauthorized()",
      "error UnauthorizedCallContext()",
      "error UpgradeFailed()",
      "error WrongOwnerAtIndex(uint256 index, bytes expectedOwner, bytes actualOwner)",
      "event AddOwner(uint256 indexed index, bytes owner)",
      "event RemoveOwner(uint256 indexed index, bytes owner)",
      "event Upgraded(address indexed implementation)",
      "function REPLAYABLE_NONCE_KEY() view returns (uint256)",
      "function addOwnerAddress(address owner)",
      "function addOwnerPublicKey(bytes32 x, bytes32 y)",
      "function canSkipChainIdValidation(bytes4 functionSelector) pure returns (bool)",
      "function domainSeparator() view returns (bytes32)",
      "function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)",
      "function entryPoint() view returns (address)",
      "function execute(address target, uint256 value, bytes data) payable",
      "function executeBatch((address target, uint256 value, bytes data)[] calls) payable",
      "function executeWithoutChainIdValidation(bytes[] calls) payable",
      "function getUserOpHashWithoutChainId((address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp) view returns (bytes32)",
      "function implementation() view returns (address $)",
      "function initialize(bytes[] owners) payable",
      "function isOwnerAddress(address account) view returns (bool)",
      "function isOwnerBytes(bytes account) view returns (bool)",
      "function isOwnerPublicKey(bytes32 x, bytes32 y) view returns (bool)",
      "function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4 result)",
      "function nextOwnerIndex() view returns (uint256)",
      "function ownerAtIndex(uint256 index) view returns (bytes)",
      "function ownerCount() view returns (uint256)",
      "function proxiableUUID() view returns (bytes32)",
      "function removeLastOwner(uint256 index, bytes owner)",
      "function removeOwnerAtIndex(uint256 index, bytes owner)",
      "function removedOwnersCount() view returns (uint256)",
      "function replaySafeHash(bytes32 hash) view returns (bytes32)",
      "function upgradeToAndCall(address newImplementation, bytes data) payable",
      "function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) returns (uint256 validationData)",
      "receive() external payable",
      "fallback() external payable",
    ]
  `)
})

describe('encodeCalls', () => {
  test('single', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      owners: [owner],
      version: '1',
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
    const account = await CoinbaseSmartAccount.from({
      client,
      owners: [owner],
      version: '1',
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
  test('single and batch', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      owners: [owner],
      version: '1',
    })
    const decodeCalls = account.decodeCalls
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
        decodeCalls(await account.encodeCalls(single)),
        decodeCalls(await account.encodeCalls(batch)),
        decodeCalls(await account.encodeCalls([])),
      ]),
    ).toEqual([single, batch, []])
  })

  test('error: unsupported function', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      owners: [owner],
      version: '1',
    })

    expect(() =>
      account.decodeCalls(AbiFunction.encodeData(account.abi, 'entryPoint')),
    ).toThrowErrorMatchingInlineSnapshot(
      `[BaseError: unable to decode calls for "entryPoint"]`,
    )
  })
})

describe('getAddress', () => {
  test('owners, nonce, version, and explicit address', async () => {
    const accounts = await Promise.all([
      CoinbaseSmartAccount.from({
        client,
        owners: [owner],
        version: '1',
      }),
      CoinbaseSmartAccount.from({
        client,
        owners: [owner2],
        version: '1',
      }),
      CoinbaseSmartAccount.from({
        client,
        owners: [owner, owner2],
        version: '1',
      }),
      CoinbaseSmartAccount.from({
        client,
        nonce: 1n,
        owners: [owner, owner2],
        version: '1',
      }),
      CoinbaseSmartAccount.from({
        address: '0x0000000000000000000000000000000000000011',
        client,
        owners: [owner],
        version: '1.1',
      }),
      CoinbaseSmartAccount.from({
        address: '0x0000000000000000000000000000000000000001',
        client,
        owners: [owner],
        version: '1',
      }),
    ])

    expect(accounts.map((account) => account.address)).toMatchInlineSnapshot(`
        [
          "0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8",
          "0xA15C25E1d03280C19634954A38D380C076fcafa7",
          "0xCf6498bcc4E30fC6e9674b156995729E0CfC62d4",
          "0x64467188b574493d5C29a3e624115eFD67B83ee1",
          "0x0000000000000000000000000000000000000011",
          "0x0000000000000000000000000000000000000001",
        ]
      `)
  })
})

describe('getFactoryArgs', () => {
  test('versions', async () => {
    const account1 = await CoinbaseSmartAccount.from({
      client,
      owners: [owner],
      version: '1',
    })
    const account11 = await CoinbaseSmartAccount.from({
      address: '0x0000000000000000000000000000000000000011',
      client,
      owners: [owner],
      version: '1.1',
    })

    expect(
      await Promise.all([
        account1.getFactoryArgs(),
        account11.getFactoryArgs(),
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "factory": "0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a",
          "factoryData": "0x3ffba36f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
        {
          "factory": "0xba5ed110efdba3d005bfc882d75358acbbb85842",
          "factoryData": "0x3ffba36f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      ]
    `)
  })
})

describe('getStubSignature', () => {
  test('local owner and owner index', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      ownerIndex: 1,
      owners: [owner, owner2],
      version: '1',
    })

    expect(await account.getStubSignature()).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000041fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c00000000000000000000000000000000000000000000000000000000000000"`,
    )
  })

  test('WebAuthn owner', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      owners: [webAuthnOwner],
      version: '1',
    })

    expect(await account.getStubSignature()).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000"`,
    )
  })
  test('WebAuthn owner index', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      ownerIndex: 1,
      owners: [owner, webAuthnOwner],
      version: '1',
    })
    const [{ ownerIndex, signatureData }] = AbiParameters.decode(
      [
        {
          components: [
            { name: 'ownerIndex', type: 'uint8' },
            { name: 'signatureData', type: 'bytes' },
          ],
          type: 'tuple',
        },
      ] as const,
      await account.getStubSignature(),
    )

    expect({ ownerIndex, signatureSize: Hex.size(signatureData) })
      .toMatchInlineSnapshot(`
      {
        "ownerIndex": 1,
        "signatureSize": 512,
      }
    `)
  })
})

describe('getNonce', () => {
  test('default and key', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      owners: [owner],
      version: '1',
    })

    expect((await account.getNonce()) > 0n).toMatchInlineSnapshot(`true`)
    expect(await account.getNonce({ key: 0n })).toMatchInlineSnapshot(`0n`)
  })
})

describe('userOperation.estimateGas', () => {
  test('owner types', async () => {
    const local = await CoinbaseSmartAccount.from({
      client,
      owners: [owner],
      version: '1',
    })
    const webAuthn = await CoinbaseSmartAccount.from({
      client,
      owners: [webAuthnOwner],
      version: '1',
    })

    expect(
      await Promise.all([
        local.userOperation?.estimateGas?.({ callData: '0x' }),
        webAuthn.userOperation?.estimateGas?.({
          callData: '0x',
          verificationGasLimit: 700_000n,
        }),
        webAuthn.userOperation?.estimateGas?.({
          callData: '0x',
          verificationGasLimit: 900_000n,
        }),
      ]),
    ).toMatchInlineSnapshot(`
      [
        undefined,
        {
          "verificationGasLimit": 800000n,
        },
        {
          "verificationGasLimit": 900000n,
        },
      ]
    `)
  })
})

test('deployed account signatures', async () => {
  const account = await CoinbaseSmartAccount.from({
    client,
    nonce: 700_070n,
    owners: [owner],
    version: '1',
  })
  await Actions.contract.write(client, {
    ...account.factory,
    account: owner,
    args: [[Hex.padLeft(owner.address)], 700_070n],
    functionName: 'createAccount',
  })
  await Actions.block.mine(client, { blocks: 1 })

  const hash =
    '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68'
  const message = 'hello world'
  const typedData = {
    ...constants.typedData.basic,
    primaryType: 'Mail',
  } as const

  expect({
    deployed: await account.isDeployed(),
    factoryArgs: await account.getFactoryArgs(),
    hash: await Actions.verifyHash(client, {
      address: account.address,
      hash,
      signature: await account.sign({ hash }),
    }),
    message: await Actions.verifyMessage(client, {
      address: account.address,
      message,
      signature: await account.signMessage({ message }),
    }),
    typedData: await Actions.verifyTypedData(client, {
      address: account.address,
      signature: await account.signTypedData(typedData),
      ...typedData,
    }),
  }).toMatchInlineSnapshot(`
    {
      "deployed": true,
      "factoryArgs": {
        "factory": undefined,
        "factoryData": undefined,
      },
      "hash": true,
      "message": true,
      "typedData": true,
    }
  `)
})

test('counterfactual account signatures', async () => {
  const account = await CoinbaseSmartAccount.from({
    client,
    nonce: 700_071n,
    owners: [owner],
    version: '1',
  })
  const hash =
    '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68'
  const message = 'hello world'
  const typedData = {
    ...constants.typedData.basic,
    primaryType: 'Mail',
  } as const

  expect({
    deployed: await account.isDeployed(),
    hash: await Actions.verifyHash(client, {
      address: account.address,
      hash,
      signature: await account.sign({ hash }),
    }),
    message: await Actions.verifyMessage(client, {
      address: account.address,
      message,
      signature: await account.signMessage({ message }),
    }),
    typedData: await Actions.verifyTypedData(client, {
      address: account.address,
      signature: await account.signTypedData(typedData),
      ...typedData,
    }),
  }).toMatchInlineSnapshot(`
    {
      "deployed": false,
      "hash": true,
      "message": true,
      "typedData": true,
    }
  `)
})

test('address owner cannot sign', async () => {
  const account = await CoinbaseSmartAccount.from({
    client,
    owners: [owner.address],
    version: '1',
  })

  await expect(() =>
    account.signUserOperation({
      callData: '0x',
      callGasLimit: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      nonce: 0n,
      preVerificationGas: 0n,
      verificationGasLimit: 0n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: owner cannot sign]`)
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

  test('local owner', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      owners: [owner],
      version: '1',
    })

    expect(
      await account.signUserOperation(userOperation),
    ).toMatchInlineSnapshot(
      `"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000414f3498080b6a124e4f4cd4239eafd5561f32a114f1e820fe20e84e890320fa693601d057e2963007fafb93d76d9019144a6872b680bec82a437475e6fe982bef1c00000000000000000000000000000000000000000000000000000000000000"`,
    )
  })

  test('WebAuthn owner', async () => {
    const account = await CoinbaseSmartAccount.from({
      client,
      owners: [webAuthnOwner],
      version: '1',
    })
    const signature = await account.signUserOperation(userOperation)
    const [{ ownerIndex, signatureData }] = AbiParameters.decode(
      [
        {
          components: [
            { name: 'ownerIndex', type: 'uint8' },
            { name: 'signatureData', type: 'bytes' },
          ],
          type: 'tuple',
        },
      ] as const,
      signature,
    )
    const [webauthn] = AbiParameters.decode(
      [
        {
          components: [
            { name: 'authenticatorData', type: 'bytes' },
            { name: 'clientDataJSON', type: 'bytes' },
            { name: 'challengeIndex', type: 'uint256' },
            { name: 'typeIndex', type: 'uint256' },
            { name: 'r', type: 'uint256' },
            { name: 's', type: 'uint256' },
          ],
          type: 'tuple',
        },
      ] as const,
      signatureData,
    )
    const challenge = UserOperation.getSignPayload(
      { ...userOperation, sender: account.address },
      {
        chainId: 1,
        entryPointAddress: EntryPoint.addressV06,
        entryPointVersion: '0.6',
      },
    )

    expect({
      ownerIndex,
      valid: WebAuthnP256.verify({
        challenge,
        metadata: {
          authenticatorData: webauthn.authenticatorData,
          challengeIndex: Number(webauthn.challengeIndex),
          clientDataJSON: Hex.toString(webauthn.clientDataJSON),
          typeIndex: Number(webauthn.typeIndex),
          userVerificationRequired: true,
        },
        publicKey: webAuthnPublicKey,
        signature: {
          r: Hex.fromNumber(webauthn.r, { size: 32 }),
          s: Hex.fromNumber(webauthn.s, { size: 32 }),
        },
      }),
    }).toMatchInlineSnapshot(`
      {
        "ownerIndex": 0,
        "valid": true,
      }
    `)
  })
})

describe.sequential('Bundler actions', () => {
  const fees = {
    maxFeePerGas: Value.fromGwei('15'),
    maxPriorityFeePerGas: Value.fromGwei('2'),
  } as const
  let fixture: Awaited<ReturnType<typeof createBundlerFixture>>

  beforeAll(async () => {
    fixture = await createBundlerFixture()
  }, 60_000)

  beforeEach(async () => {
    await bundler.restart()
  })

  test('estimateGas', async () => {
    const gas = await AccountAbstractionActions.userOperation.estimateGas(
      fixture.bundlerClient,
      {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        ...fees,
      },
    )

    expect({
      callGasLimit: gas.callGasLimit > 0n,
      preVerificationGas: gas.preVerificationGas > 0n,
      verificationGasLimit: gas.verificationGasLimit > 0n,
    }).toMatchInlineSnapshot(`
      {
        "callGasLimit": true,
        "preVerificationGas": true,
        "verificationGasLimit": true,
      }
    `)
  })

  test('prepare', async () => {
    const operation = await AccountAbstractionActions.userOperation.prepare(
      fixture.bundlerClient,
      {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        ...fees,
      },
    )

    expect({
      callData: operation.callData.startsWith('0xb61d27f6'),
      callGasLimit: operation.callGasLimit > 0n,
      initCode: operation.initCode?.startsWith(fixture.account.factory.address),
      maxFeePerGas: operation.maxFeePerGas,
      maxPriorityFeePerGas: operation.maxPriorityFeePerGas,
      nonce: operation.nonce >= 0n,
      paymasterAndData: operation.paymasterAndData,
      preVerificationGas: operation.preVerificationGas > 0n,
      sender: operation.sender === fixture.account.address,
      signature: Hex.size(operation.signature) > 0,
      verificationGasLimit: operation.verificationGasLimit > 0n,
    }).toMatchInlineSnapshot(`
      {
        "callData": true,
        "callGasLimit": true,
        "initCode": true,
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": true,
        "paymasterAndData": "0x",
        "preVerificationGas": true,
        "sender": true,
        "signature": true,
        "verificationGasLimit": true,
      }
    `)
  })

  test('send', { timeout: 30_000 }, async () => {
    const recipient = constants.accounts[8].address
    const balance = await Actions.address.getBalance(client, {
      address: recipient,
    })
    const hash = await AccountAbstractionActions.userOperation.send(
      fixture.bundlerClient,
      {
        calls: [{ to: recipient, value: 1n }],
        ...fees,
      },
    )
    const receiptPromise =
      AccountAbstractionActions.userOperation.waitForReceipt<'0.6'>(
        fixture.bundlerClient,
        { hash, pollingInterval: 50, timeout: 15_000 },
      )

    await fixture.bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await Actions.block.mine(client, { blocks: 1 })
    const receipt = await receiptPromise

    expect({
      hash: Hex.size(hash) === 32,
      included: receipt.success,
      operationHash: receipt.userOpHash === hash,
      transferred:
        (await Actions.address.getBalance(client, { address: recipient })) ===
        balance + 1n,
    }).toMatchInlineSnapshot(`
      {
        "hash": true,
        "included": true,
        "operationHash": true,
        "transferred": true,
      }
    `)
  })
})

async function createBundlerFixture() {
  const account = await CoinbaseSmartAccount.from({
    client,
    owners: [owner],
    version: '1',
  })
  await Actions.address.setBalance(client, {
    address: account.address,
    value: Value.fromEther('100'),
  })
  const bundlerClient = AccountAbstractionClient.create({
    account,
    client,
    pollingInterval: 50,
    transport: http(bundler.rpcUrl.http),
  })
  return { account, bundlerClient }
}
