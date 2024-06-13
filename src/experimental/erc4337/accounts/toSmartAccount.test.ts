import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { deployMock4337Account } from '../../../../test/src/utils.js'
import { mine, writeContract } from '../../../actions/index.js'
import { pad } from '../../../utils/index.js'
import { solady } from './implementations/solady.js'
import { toSmartAccount } from './toSmartAccount.js'

const client = anvilMainnet.getClient({ account: true })

test('default', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = toSmartAccount({
    address: '0x0000000000000000000000000000000000000000',
    client,
    implementation: solady({
      factoryAddress,
      owner: accounts[1].address,
    }),
  })

  expect({
    ...account,
    _internal: null,
    abi: null,
    factory: null,
  }).toMatchInlineSnapshot(`
    {
      "_internal": null,
      "abi": null,
      "address": "0x0000000000000000000000000000000000000000",
      "entryPointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      "entryPointVersion": "0.7",
      "factory": null,
      "getAddress": [Function],
      "getCallData": [Function],
      "getFactoryArgs": [Function],
      "getFormattedSignature": [Function],
      "getNonce": [Function],
      "initialize": [Function],
      "initialized": true,
      "isDeployed": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
    }
  `)
})

test('behavior: initialize', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: accounts[1].address,
    }),
  })
  expect(() => account.address).toThrowError()

  const account_initialized = await account.initialize(client)
  expect({
    ...account_initialized,
    _internal: null,
    abi: null,
    factory: null,
  }).toMatchInlineSnapshot(`
    {
      "_internal": null,
      "abi": null,
      "address": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
      "entryPointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      "entryPointVersion": "0.7",
      "factory": null,
      "getAddress": [Function],
      "getCallData": [Function],
      "getFactoryArgs": [Function],
      "getFormattedSignature": [Function],
      "getNonce": [Function],
      "initialize": [Function],
      "initialized": true,
      "isDeployed": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
    }
  `)
})

test('return value: `isDeployed`', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: accounts[1].address,
    }),
  })
  expect(await account.isDeployed()).toBe(false)

  const account_initialized = await account.initialize(client)
  expect(await account.isDeployed()).toBe(false)

  await writeContract(client, {
    ...account_initialized.factory,
    functionName: 'createAccount',
    args: [account.address, pad('0x0')],
  })
  await mine(client, {
    blocks: 1,
  })

  expect(await account_initialized.isDeployed()).toBe(true)
  expect(await account_initialized.isDeployed()).toBe(true)
})

test('return value: `getFactoryArgs`', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    implementation: solady({
      factoryAddress,
      owner: accounts[1].address,
    }),
  }).initialize(client)

  expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
    {
      "factory": "0x82a9286db983093ff234cefcea1d8fa66382876b",
      "factoryData": "0xf14ddffc00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000000",
    }
  `)

  await writeContract(client, {
    ...account.factory,
    functionName: 'createAccount',
    args: [account.address, pad('0x0')],
  })
  await mine(client, {
    blocks: 1,
  })

  expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
    {
      "factory": undefined,
      "factoryData": undefined,
    }
  `)
})
