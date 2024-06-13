import type { Address } from 'abitype'
import { beforeAll, describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../../../test/src/anvil.js'
import { accounts, typedData } from '../../../../../test/src/constants.js'
import { deployMock4337Account } from '../../../../../test/src/utils.js'
import { privateKeyToAccount } from '../../../../accounts/privateKeyToAccount.js'
import {
  mine,
  verifyMessage,
  verifyTypedData,
  writeContract,
} from '../../../../actions/index.js'
import { pad } from '../../../../utils/data/pad.js'
import { solady } from './solady.js'

const client = anvilMainnet.getClient({ account: true })

let factoryAddress: Address
beforeAll(async () => {
  const { factoryAddress: _factoryAddress } = await deployMock4337Account()
  factoryAddress = _factoryAddress
})

test('default', async () => {
  const implementation = solady({
    factoryAddress,
    owner: accounts[1].address,
  })({ client })

  expect({
    ...implementation,
    _internal: null,
    abi: null,
    factory: null,
  }).toMatchInlineSnapshot(`
    {
      "_internal": null,
      "abi": null,
      "entryPointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      "entryPointVersion": "0.7",
      "factory": null,
      "getAddress": [Function],
      "getCallData": [Function],
      "getFactoryArgs": [Function],
      "getFormattedSignature": [Function],
      "getNonce": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
    }
  `)
})

test('args: entryPointAddress', async () => {
  const implementation = solady({
    entryPointAddress: '0x0000000000000000000000000000000000000069',
    factoryAddress,
    owner: accounts[1].address,
  })({ client })

  expect(implementation.entryPointAddress).toMatchInlineSnapshot(
    `"0x0000000000000000000000000000000000000069"`,
  )
})

test('args: salt', async () => {
  const account_1 = solady({
    factoryAddress,
    salt: '0x1',
    owner: accounts[1].address,
  })({ client })

  const account_2 = solady({
    factoryAddress,
    salt: '0x2',
    owner: accounts[1].address,
  })({ client })

  expect(await account_1.getAddress()).toMatchInlineSnapshot(
    `"0x0b3D649C00208AFB6A40b4A7e918b84A52D783B8"`,
  )
  expect(await account_2.getAddress()).toMatchInlineSnapshot(
    `"0x274B2baeCC1A87493db36439Df3D8012855fB182"`,
  )
})

describe('return value: entryPointAddress', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    expect(implementation.entryPointAddress).toMatchInlineSnapshot(
      `"0x0000000071727De22E5E9d8BAf0edAc6f37da032"`,
    )
  })

  test('via arg', async () => {
    const implementation = solady({
      entryPointAddress: '0x0000000000000000000000000000000000000069',
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    expect(implementation.entryPointAddress).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000069"`,
    )
  })
})

describe('return value: getAddress', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const address = await implementation.getAddress()
    expect(address).toMatchInlineSnapshot(
      `"0xE911628bF8428C23f179a07b081325cAe376DE1f"`,
    )
  })
})

describe('return value: getCallData', () => {
  test('single', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const callData_1 = await implementation.getCallData([
      { to: '0x0000000000000000000000000000000000000000' },
    ])
    const callData_2 = await implementation.getCallData([
      { to: '0x0000000000000000000000000000000000000000', value: 69n },
    ])
    const callData_3 = await implementation.getCallData([
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
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const callData = await implementation.getCallData([
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
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const signature = await implementation.getFactoryArgs()
    expect(signature).toMatchInlineSnapshot(
      `
      {
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000000",
      }
    `,
    )
  })
})

describe('return value: getFormattedSignature', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const signature = await implementation.getFormattedSignature()
    expect(signature).toMatchInlineSnapshot(
      `"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"`,
    )

    const signature_2 = await implementation.getFormattedSignature({
      signature: '0xdeadbeef',
    })
    expect(signature_2).toMatchInlineSnapshot(`"0xdeadbeef"`)
  })
})

describe('return value: getNonce', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const nonce = await implementation.getNonce()
    expect(nonce).toMatchInlineSnapshot('0n')
  })
})

describe('return value: signMessage', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    await writeContract(client, {
      ...implementation.factory,
      functionName: 'createAccount',
      args: [accounts[1].address, pad('0x0')],
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
})

describe('return value: signTypedData', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })({ client })

    await writeContract(client, {
      ...implementation.factory,
      functionName: 'createAccount',
      args: [accounts[1].address, pad('0x0')],
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
})

describe('return value: signUserOperation', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const signature = await implementation.signUserOperation({
      userOperation: {
        callData: '0xdeadbeef',
        callGasLimit: 69n,
        maxFeePerGas: 69n,
        maxPriorityFeePerGas: 69n,
        nonce: 0n,
        preVerificationGas: 69n,
        signature: '0xdeadbeef',
        verificationGasLimit: 69n,
      },
    })

    expect(signature).toMatchInlineSnapshot(
      `"0x9500afd481cfd9e21302f178c616fe23c3762829e87ff4ff012cdf10b2633cd408cc37e045774581b21035e90d645e23cbc4857468cd83f690c4fecec246d53a1b"`,
    )
  })
})
