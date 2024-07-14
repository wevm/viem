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
    const implementation = coinbase({
      owners: [owner],
      nonce: 69n,
    })({ client })

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
    const implementation = coinbase({
      owners: [owner],
      nonce: 112312n,
    })({ client })

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
})
