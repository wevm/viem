import { beforeAll, describe, expect, test, vi } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { accounts, typedData } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  mine,
  sendTransaction,
  verifyMessage,
  verifyTypedData,
  writeContract,
} from '../../../actions/index.js'
import { keccak256, pad, parseEther } from '../../../utils/index.js'
import { estimateUserOperationGas } from '../../actions/bundler/estimateUserOperationGas.js'
import { prepareUserOperation } from '../../actions/bundler/prepareUserOperation.js'
import { sendUserOperation } from '../../actions/bundler/sendUserOperation.js'
import { toWebAuthnAccount } from '../toWebAuthnAccount.js'
import {
  sign,
  toCoinbaseSmartAccount,
  wrapSignature,
} from './toCoinbaseSmartAccount.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient({ client })

const owner = privateKeyToAccount(accounts[0].privateKey)

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))
  return () => vi.useRealTimers()
})

describe('return value: encodeCalls', () => {
  test('single', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const callData_1 = await account.encodeCalls([
      { to: '0x0000000000000000000000000000000000000000' },
    ])
    const callData_2 = await account.encodeCalls([
      { to: '0x0000000000000000000000000000000000000000', value: 69n },
    ])
    const callData_3 = await account.encodeCalls([
      {
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
        data: '0xdeadbeef',
      },
    ])

    expect(callData_1).toMatchInlineSnapshot(
      `"0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000"`,
    )
    expect(callData_2).toMatchInlineSnapshot(
      `"0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000"`,
    )
    expect(callData_3).toMatchInlineSnapshot(
      `"0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000"`,
    )
  })

  test('batch', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const callData = await account.encodeCalls([
      { to: '0x0000000000000000000000000000000000000000' },
      { to: '0x0000000000000000000000000000000000000000', value: 69n },
      {
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
        data: '0xdeadbeef',
      },
    ])

    expect(callData).toMatchInlineSnapshot(
      `"0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000"`,
    )
  })
})

describe('return value: getAddress', () => {
  test('default', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const address = await account.getAddress()
    expect(address).toMatchInlineSnapshot(
      `"0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8"`,
    )

    const implementation_2 = await toCoinbaseSmartAccount({
      client,
      owners: [privateKeyToAccount(accounts[1].privateKey)],
    })

    const address_2 = await implementation_2.getAddress()
    expect(address_2).toMatchInlineSnapshot(
      `"0xA15C25E1d03280C19634954A38D380C076fcafa7"`,
    )

    const implementation_3 = await toCoinbaseSmartAccount({
      client,
      owners: [owner, privateKeyToAccount(accounts[1].privateKey)],
    })

    const address_3 = await implementation_3.getAddress()
    expect(address_3).toMatchInlineSnapshot(
      `"0xCf6498bcc4E30fC6e9674b156995729E0CfC62d4"`,
    )

    const implementation_4 = await toCoinbaseSmartAccount({
      client,
      owners: [owner, privateKeyToAccount(accounts[1].privateKey)],
      nonce: 1n,
    })

    const address_4 = await implementation_4.getAddress()
    expect(address_4).toMatchInlineSnapshot(
      `"0x64467188b574493d5C29a3e624115eFD67B83ee1"`,
    )

    const implementation_5 = await toCoinbaseSmartAccount({
      address: '0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8',
      client,
      owners: [owner],
    })

    const address_5 = (await implementation_5).address
    expect(address_5).toMatchInlineSnapshot(
      `"0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8"`,
    )
  })
})

describe('return value: getFactoryArgs', () => {
  test('default', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const signature = await account.getFactoryArgs()
    expect(signature).toMatchInlineSnapshot(
      `
      {
        "factory": "0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a",
        "factoryData": "0x3ffba36f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `,
    )
  })
})

describe('return value: getStubSignature', () => {
  test('default: private key', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const signature = await account.getStubSignature()
    expect(signature).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000041fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c00000000000000000000000000000000000000000000000000000000000000"`,
    )
  })

  test('default: webauthn', async () => {
    const owner = toWebAuthnAccount({
      credential: { id: 'abc', publicKey: '0xdeadbeef' },
    })

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const signature = await account.getStubSignature()
    expect(signature).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000"`,
    )
  })
})

describe('return value: getNonce', () => {
  test('default', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const nonce = await account.getNonce()
    expect(nonce).toMatchInlineSnapshot('30902162761021348478818713600000n')
  })
})

describe('return value: userOperation.estimateGas', () => {
  test('default: private key', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const request = await account.userOperation?.estimateGas?.({
      callData: '0xdeadbeef',
    })
    expect(request).toMatchInlineSnapshot('undefined')
  })

  test('default: webauthn', async () => {
    const owner = toWebAuthnAccount({
      credential: { id: 'abc', publicKey: '0xdeadbeef' },
    })

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const request = await account.userOperation?.estimateGas?.({
      callData: '0xdeadbeef',
    })
    expect(request).toMatchInlineSnapshot(
      `
      {
        "verificationGasLimit": 800000n,
      }
    `,
    )
  })
})

describe('return value: signMessage', () => {
  test('default', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
      nonce: 70n,
    })

    await writeContract(client, {
      ...account.factory,
      functionName: 'createAccount',
      args: [[pad(owner.address)], 70n],
    })
    await mine(client, {
      blocks: 1,
    })

    const signature = await account.signMessage({
      message: 'hello world',
    })

    const result = await verifyMessage(client, {
      address: await account.getAddress(),
      message: 'hello world',
      signature,
    })

    expect(result).toBeTruthy()
  })

  test('counterfactual', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
      nonce: 141241n,
    })

    const signature = await account.signMessage({
      message: 'hello world',
    })

    const result = await verifyMessage(client, {
      address: await account.getAddress(),
      message: 'hello world',
      signature,
    })

    expect(result).toBeTruthy()
  })
})

describe('return value: signTypedData', () => {
  test('default', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
      nonce: 515151n,
    })

    await writeContract(client, {
      ...account.factory,
      functionName: 'createAccount',
      args: [[pad(owner.address)], 515151n],
    })
    await mine(client, {
      blocks: 1,
    })

    const signature = await account.signTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    })

    const result = await verifyTypedData(client, {
      address: await account.getAddress(),
      signature,
      ...typedData.basic,
      primaryType: 'Mail',
    })
    expect(result).toBeTruthy()
  })

  test('counterfactual', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
      nonce: 112312n,
    })

    const signature = await account.signTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    })

    const result = await verifyTypedData(client, {
      address: await account.getAddress(),
      signature,
      ...typedData.basic,
      primaryType: 'Mail',
    })
    expect(result).toBeTruthy()
  })
})

describe('return value: signUserOperation', () => {
  test('default', async () => {
    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    })

    const signature = await account.signUserOperation({
      callData: '0xdeadbeef',
      callGasLimit: 69n,
      maxFeePerGas: 69n,
      maxPriorityFeePerGas: 69n,
      nonce: 0n,
      preVerificationGas: 69n,
      signature: '0xdeadbeef',
      verificationGasLimit: 69n,
    })

    expect(signature).toMatchInlineSnapshot(
      `"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000414f3498080b6a124e4f4cd4239eafd5561f32a114f1e820fe20e84e890320fa693601d057e2963007fafb93d76d9019144a6872b680bec82a437475e6fe982bef1c00000000000000000000000000000000000000000000000000000000000000"`,
    )
  })
})

describe('sign', async () => {
  test('private key', async () => {
    const signature = await sign({
      owner,
      hash: keccak256('0xdeadbeef'),
    })
    expect(signature).toMatchInlineSnapshot(
      `"0xa8a8de243232c52140496c6b3e428090a8a944e1da3af2d6873d0f2151aa54b35aa7e59729d04cd6cc405bacc7e5e834ad56a945a1b2570948ba39febdfbdd3c1c"`,
    )
  })

  test('webauthn', async () => {
    const credential = {
      id: 'm1-bMPuAqpWhCxHZQZTT6e-lSPntQbh3opIoGe7g4Qs',
      publicKey:
        '0x7da44d4bc972affd138c619a211ef0afe0926b813fec67d15587cf8625b2bf185f5044ae96640a63b32aa1eb6f8f993006bbd26292b81cb07a0672302c69a866',
    } as const
    const owner = toWebAuthnAccount({
      credential,
      getFn() {
        return Promise.resolve({
          response: {
            authenticatorData: [
              73, 150, 13, 229, 136, 14, 140, 104, 116, 52, 23, 15, 100, 118,
              96, 91, 143, 228, 174, 185, 162, 134, 50, 199, 153, 92, 243, 186,
              131, 29, 151, 99, 5, 0, 0, 0, 0,
            ],
            clientDataJSON: [
              123, 34, 116, 121, 112, 101, 34, 58, 34, 119, 101, 98, 97, 117,
              116, 104, 110, 46, 103, 101, 116, 34, 44, 34, 99, 104, 97, 108,
              108, 101, 110, 103, 101, 34, 58, 34, 49, 80, 49, 79, 71, 74, 69,
              121, 74, 122, 65, 50, 82, 74, 95, 74, 52, 82, 71, 89, 120, 122,
              107, 87, 71, 48, 119, 66, 70, 113, 109, 105, 51, 77, 51, 54, 72,
              69, 107, 103, 66, 118, 69, 34, 44, 34, 111, 114, 105, 103, 105,
              110, 34, 58, 34, 104, 116, 116, 112, 58, 47, 47, 108, 111, 99, 97,
              108, 104, 111, 115, 116, 58, 53, 49, 55, 51, 34, 44, 34, 99, 114,
              111, 115, 115, 79, 114, 105, 103, 105, 110, 34, 58, 102, 97, 108,
              115, 101, 125,
            ],
            signature: [
              48, 69, 2, 33, 0, 198, 106, 113, 129, 35, 170, 51, 12, 13, 0, 67,
              158, 211, 55, 188, 103, 33, 194, 2, 152, 190, 159, 181, 11, 176,
              232, 114, 59, 99, 64, 167, 220, 2, 32, 101, 188, 55, 216, 145,
              203, 39, 137, 83, 114, 45, 10, 147, 246, 218, 247, 132, 221, 228,
              225, 57, 110, 143, 87, 172, 198, 76, 141, 30, 169, 166, 2,
            ],
          },
        } as any)
      },
      rpId: '',
    })

    const signature = await sign({
      owner,
      hash: keccak256('0xdeadbeef'),
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001c66a718123aa330c0d00439ed337bc6721c20298be9fb50bb0e8723b6340a7dc65bc37d891cb278953722d0a93f6daf784dde4e1396e8f57acc64c8d1ea9a602000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000867b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a223150314f474a45794a7a4132524a5f4a34524759787a6b574730774246716d69334d333648456b67427645222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a35313733222c2263726f73734f726967696e223a66616c73657d0000000000000000000000000000000000000000000000000000"`,
    )
  })
})

describe('wrapSignature', () => {
  test('default: private key', async () => {
    expect(
      wrapSignature({
        signature:
          '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
      }),
    ).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000041fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c00000000000000000000000000000000000000000000000000000000000000"`,
    )
  })

  test('default: webauthn', async () => {
    expect(
      wrapSignature({
        signature:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(
      `"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000"`,
    )
  })
})

describe('smoke', async () => {
  const account = await toCoinbaseSmartAccount({
    client,
    owners: [owner],
  })

  await sendTransaction(client, {
    account: accounts[9].address,
    to: account.address,
    value: parseEther('100'),
  })
  await mine(client, {
    blocks: 1,
  })

  test('estimateUserOperationGas', async () => {
    const gas = await estimateUserOperationGas(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
        },
      ],
    })

    expect(gas).toMatchInlineSnapshot(`
      {
        "callGasLimit": 80000n,
        "preVerificationGas": 67086n,
        "verificationGasLimit": 369595n,
      }
    `)
  })

  test('prepareUserOperation', async () => {
    const userOperation = await prepareUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
        },
      ],
      maxFeePerGas: 22785120848n,
      maxPriorityFeePerGas: 2000000000n,
    })

    expect({ ...userOperation, account: null }).toMatchInlineSnapshot(`
      {
        "account": null,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "initCode": "0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a3ffba36f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "maxFeePerGas": 22785120848n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761039795222892423151616n,
        "paymasterAndData": "0x",
        "paymasterPostOpGasLimit": undefined,
        "paymasterVerificationGasLimit": undefined,
        "preVerificationGas": 67086n,
        "sender": "0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8",
        "signature": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000041fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c00000000000000000000000000000000000000000000000000000000000000",
        "verificationGasLimit": 369595n,
      }
    `)
  })

  test('sendUserOperation', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: 1n,
        },
      ],
      callGasLimit: 80000n,
      verificationGasLimit: 369595n,
      preVerificationGas: 67100n,
      maxFeePerGas: 22785120848n,
      maxPriorityFeePerGas: 2000000000n,
    })

    expect(hash).toMatchInlineSnapshot(
      `"0xd3ca1852906b0ee560734f84a806bc8fe5df98cf3dda4fe8ffe9ba6a8c9a85ea"`,
    )
  })
})
