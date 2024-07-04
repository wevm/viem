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

  const account = await toSmartAccount({
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

  const account = await toSmartAccount({
    client,
    implementation: solady({
      factoryAddress,
      owner: accounts[1].address,
    }),
  })
  expect(await account.isDeployed()).toBe(false)

  await writeContract(client, {
    ...account.factory,
    functionName: 'createAccount',
    args: [account.address, pad('0x0')],
  })
  await mine(client, {
    blocks: 1,
  })

  expect(await account.isDeployed()).toBe(true)
  expect(await account.isDeployed()).toBe(true)
})

test('return value: `getFactoryArgs`', async () => {
  const { factoryAddress } = await deployMock4337Account()

  const account = await toSmartAccount({
    client,
    implementation: solady({
      factoryAddress,
      owner: accounts[1].address,
    }),
  })

  expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
    {
      "factory": "0xd73bab8f06db28c87932571f87d0d2c0fdf13d94",
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
