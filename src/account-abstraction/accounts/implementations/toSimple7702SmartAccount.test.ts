import type { Address } from 'abitype'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { accounts, typedData } from '~test/constants.js'
import { deploySimple7702Account_08 } from '~test/utils.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  mine,
  sendTransaction,
  signAuthorization,
  verifyMessage,
  verifyTypedData,
} from '../../../actions/index.js'
import { zeroAddress } from '../../../constants/address.js'
import { toSimple7702SmartAccount } from './toSimple7702SmartAccount.js'

const client = anvilMainnet.getClient({ account: true })

let implementation: Address
beforeAll(async () => {
  const { implementationAddress: _implementation } =
    await deploySimple7702Account_08()
  implementation = _implementation
})

test('default', async () => {
  const account = await toSimple7702SmartAccount({
    client,
    owner: privateKeyToAccount(accounts[1].privateKey),
  })

  expect({
    ...account,
    _internal: null,
    abi: null,
    entryPoint: null,
    client: null,
    factory: null,
  }).toMatchInlineSnapshot(`
    {
      "_internal": null,
      "abi": null,
      "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "authorization": {
        "account": {
          "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "nonceManager": undefined,
          "publicKey": "0x04ba5734d8f7091719471e7f7ed6b9df170dc70cc661ca05e688601ad984f068b0d67351e5f06073092499336ab0839ef8a521afd334e53807205fa2f08eec74f4",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "address": "0xe6Cae83BdE06E4c305530e199D7217f42808555B",
      },
      "client": null,
      "decodeCalls": [Function],
      "encodeCalls": [Function],
      "entryPoint": null,
      "factory": null,
      "getAddress": [Function],
      "getFactoryArgs": [Function],
      "getNonce": [Function],
      "getStubSignature": [Function],
      "isDeployed": [Function],
      "owner": {
        "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "nonceManager": undefined,
        "publicKey": "0x04ba5734d8f7091719471e7f7ed6b9df170dc70cc661ca05e688601ad984f068b0d67351e5f06073092499336ab0839ef8a521afd334e53807205fa2f08eec74f4",
        "sign": [Function],
        "signAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "privateKey",
        "type": "local",
      },
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
    }
  `)
})

describe('return value: getAddress', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

    const address = await account.getAddress()
    expect(address).toMatchInlineSnapshot(
      `"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"`,
    )
  })
})

describe('return value: decodeCalls', () => {
  test('single', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

    const calls = [
      {
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
        data: '0xdeadbeef',
      },
    ] as const

    const data = await account.encodeCalls(calls)
    const decoded = await account.decodeCalls?.(data)
    expect(decoded).toEqual(calls)
  })

  test('batch', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

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
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
        data: '0xdeadbeef',
      },
    ] as const

    const data = await account.encodeCalls(calls)
    const decoded = await account.decodeCalls?.(data)
    expect(decoded).toEqual(calls)
  })
})

describe('return value: encodeCalls', () => {
  test('single', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
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

describe('return value: getFactoryArgs', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

    const signature = await account.getFactoryArgs()
    expect(signature).toMatchInlineSnapshot(
      `
      {
        "factory": "0x7702",
        "factoryData": "0x",
      }
    `,
    )
  })
})

describe('return value: getSignature', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

    const signature = await account.getStubSignature()
    expect(signature).toMatchInlineSnapshot(
      `"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"`,
    )
  })
})

describe('return value: getNonce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))
    return () => vi.useRealTimers()
  })

  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

    const nonce = await account.getNonce()
    expect(nonce).toMatchInlineSnapshot('30902162761021348478818713600000n')
  })

  test('args: key', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

    const nonce = await account.getNonce({ key: 0n })
    expect(nonce).toMatchInlineSnapshot('0n')
  })
})

describe('return value: signMessage', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

    const authorization = await signAuthorization(client, {
      address: implementation,
      account: privateKeyToAccount(accounts[1].privateKey),
    })

    await sendTransaction(client, {
      account: privateKeyToAccount(accounts[1].privateKey),
      to: zeroAddress,
      value: 0n,
      data: '0x',
      authorizationList: [authorization],
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
})

describe('return value: signTypedData', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
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
      `"0xf29d9b44ec09b8542328c9f75a6e36976ac3507b43fa2d86f06b5157e60db7207bafccde8e7a308019dce8b540642e6134a5aebd69bfacb1778928c7f7c774711c"`,
    )
  })
})
