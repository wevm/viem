import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import { accounts, typedData } from '../../../test/src/constants.js'
import {
  estimateUserOperationGas,
  mine,
  prepareUserOperation,
  sendTransaction,
  sendUserOperation,
  verifyMessage,
  verifyTypedData,
  writeContract,
} from '../../actions/index.js'
import { pad, parseEther } from '../../utils/index.js'
import { privateKeyToAccount } from '../privateKeyToAccount.js'
import { toSmartAccount } from '../toSmartAccount.js'
import { coinbase } from './coinbase.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient({ client })

const owner = privateKeyToAccount(accounts[0].privateKey)

describe('smoke', async () => {
  const account = await toSmartAccount({
    client,
    implementation: coinbase({
      owners: [owner],
    }),
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
    })

    expect({ ...userOperation, account: null }).toMatchInlineSnapshot(`
      {
        "account": null,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "initCode": "0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a3ffba36f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "maxFeePerGas": 22785120848n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterAndData": "0x",
        "paymasterPostOpGasLimit": undefined,
        "paymasterVerificationGasLimit": undefined,
        "preVerificationGas": 67086n,
        "sender": "0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8",
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
      `"0x474c699faf5a903f0cbf9d2b583f5bd14c598bdeda1815487abdfe621a0520b6"`,
    )
  })
})

describe('return value: encodeCalls', () => {
  test('single', async () => {
    const implementation = coinbase({
      owners: [owner],
    })({ client })

    const callData_1 = await implementation.encodeCalls([
      { to: '0x0000000000000000000000000000000000000000' },
    ])
    const callData_2 = await implementation.encodeCalls([
      { to: '0x0000000000000000000000000000000000000000', value: 69n },
    ])
    const callData_3 = await implementation.encodeCalls([
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
    const implementation = coinbase({
      owners: [owner],
    })({ client })

    const callData = await implementation.encodeCalls([
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
    const implementation = coinbase({
      owners: [owner],
    })({ client })

    const address = await implementation.getAddress()
    expect(address).toMatchInlineSnapshot(
      `"0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8"`,
    )

    const implementation_2 = coinbase({
      owners: [privateKeyToAccount(accounts[1].privateKey)],
    })({ client })

    const address_2 = await implementation_2.getAddress()
    expect(address_2).toMatchInlineSnapshot(
      `"0xA15C25E1d03280C19634954A38D380C076fcafa7"`,
    )

    const implementation_3 = coinbase({
      owners: [owner, privateKeyToAccount(accounts[1].privateKey)],
    })({ client })

    const address_3 = await implementation_3.getAddress()
    expect(address_3).toMatchInlineSnapshot(
      `"0xCf6498bcc4E30fC6e9674b156995729E0CfC62d4"`,
    )

    const implementation_4 = coinbase({
      owners: [owner, privateKeyToAccount(accounts[1].privateKey)],
      nonce: 1n,
    })({ client })

    const address_4 = await implementation_4.getAddress()
    expect(address_4).toMatchInlineSnapshot(
      `"0x64467188b574493d5C29a3e624115eFD67B83ee1"`,
    )

    const implementation_5 = toSmartAccount({
      address: '0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8',
      client,
      implementation: coinbase({
        owners: [owner],
      }),
    })

    const address_5 = (await implementation_5).address
    expect(address_5).toMatchInlineSnapshot(
      `"0xBb0c1d5E7f530e8e648150fc7Cf30912575523E8"`,
    )
  })
})

describe('return value: getFactoryArgs', () => {
  test('default', async () => {
    const implementation = coinbase({
      owners: [owner],
    })({ client })

    const signature = await implementation.getFactoryArgs()
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
  test('default', async () => {
    const implementation = coinbase({
      owners: [owner],
    })({ client })

    const signature = await implementation.getStubSignature()
    expect(signature).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000041fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c00000000000000000000000000000000000000000000000000000000000000"`,
    )
  })
})

describe('return value: getNonce', () => {
  test('default', async () => {
    const implementation = coinbase({
      owners: [owner],
    })({ client })

    const nonce = await implementation.getNonce()
    expect(nonce).toMatchInlineSnapshot('0n')
  })
})

describe('return value: signMessage', () => {
  test('default', async () => {
    const implementation = coinbase({
      owners: [owner],
      nonce: 70n,
    })({ client })

    await writeContract(client, {
      ...implementation.factory,
      functionName: 'createAccount',
      args: [[pad(owner.address)], 70n],
    })
    await mine(client, {
      blocks: 1,
    })

    const signature = await implementation.signMessage({
      message: 'hello world',
    })

    const result = await verifyMessage(client, {
      address: await implementation.getAddress(),
      message: 'hello world',
      signature,
    })

    expect(result).toBeTruthy()
  })

  test('counterfactual', async () => {
    const account = await toSmartAccount({
      client,
      implementation: coinbase({
        owners: [owner],
        nonce: 141241n,
      }),
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
    const implementation = coinbase({
      owners: [owner],
      nonce: 515151n,
    })({ client })

    await writeContract(client, {
      ...implementation.factory,
      functionName: 'createAccount',
      args: [[pad(owner.address)], 515151n],
    })
    await mine(client, {
      blocks: 1,
    })

    const signature = await implementation.signTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    })

    const result = await verifyTypedData(client, {
      address: await implementation.getAddress(),
      signature,
      ...typedData.basic,
      primaryType: 'Mail',
    })
    expect(result).toBeTruthy()
  })

  test('counterfactual', async () => {
    const account = await toSmartAccount({
      client,
      implementation: coinbase({
        owners: [owner],
        nonce: 112312n,
      }),
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
    const implementation = coinbase({
      owners: [owner],
    })({ client })

    const signature = await implementation.signUserOperation({
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
