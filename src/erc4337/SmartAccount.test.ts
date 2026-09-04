import { EntryPoint } from 'ox/erc4337'
import { SignatureErc6492 } from 'ox/erc6492'
import { expect, test } from 'vitest'

import { getClient, local } from '~test/anvil.js'
import { setCode } from '../core/actions/address/test/setCode.js'
import * as NonceManager from '../core/NonceManager.js'
import * as SmartAccount from './SmartAccount.js'

const client = getClient(local)

function implementation(options: {
  address: `0x${string}`
  factory?: `0x${string}` | '0x7702' | undefined
  nonceKeyManager?: NonceManager.NonceManager | undefined
}) {
  const {
    address,
    factory = '0x000000000000000000000000000000000000fac1',
    nonceKeyManager,
  } = options
  return {
    client,
    entryPoint: {
      abi: EntryPoint.abiV07,
      address: EntryPoint.addressV07,
      version: '0.7',
    },
    encodeCalls() {
      return Promise.resolve('0xdeadbeef' as const)
    },
    extend: { label: 'test' as const },
    getAddress() {
      return Promise.resolve(address)
    },
    getFactoryArgs() {
      return Promise.resolve({ factory, factoryData: '0xcafebabe' as const })
    },
    getStubSignature() {
      return Promise.resolve('0x1234' as const)
    },
    nonceKeyManager,
    sign() {
      return Promise.resolve('0x1234' as const)
    },
    signMessage() {
      return Promise.resolve('0x1234' as const)
    },
    signTypedData() {
      return Promise.resolve('0x1234' as const)
    },
    signUserOperation() {
      return Promise.resolve('0x1234' as const)
    },
  } as const
}

test('default', async () => {
  const address = '0x000000000000000000000000000000000000aac1'
  await setCode(client, { address, bytecode: '0x' })

  const account = await SmartAccount.from(implementation({ address }))

  expect({
    ...account,
    client: null,
    entryPoint: null,
  }).toMatchInlineSnapshot(`
    {
      "address": "0x000000000000000000000000000000000000aac1",
      "client": null,
      "encodeCalls": [Function],
      "entryPoint": null,
      "getAddress": [Function],
      "getFactoryArgs": [Function],
      "getNonce": [Function],
      "getStubSignature": [Function],
      "isDeployed": [Function],
      "label": "test",
      "sign": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
    }
  `)
})

test('isDeployed', async () => {
  const address = '0x000000000000000000000000000000000000aac2'
  await setCode(client, { address, bytecode: '0x' })

  const account = await SmartAccount.from(implementation({ address }))
  expect(await account.isDeployed()).toMatchInlineSnapshot(`false`)

  await setCode(client, { address, bytecode: '0x6000' })
  expect(await account.isDeployed()).toMatchInlineSnapshot(`true`)

  await setCode(client, { address, bytecode: '0x' })
  expect(await account.isDeployed()).toMatchInlineSnapshot(`true`)
})

test('getFactoryArgs', async () => {
  const address = '0x000000000000000000000000000000000000aac3'
  await setCode(client, { address, bytecode: '0x' })

  const account = await SmartAccount.from(implementation({ address }))
  expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
    {
      "factory": "0x000000000000000000000000000000000000fac1",
      "factoryData": "0xcafebabe",
    }
  `)

  await setCode(client, { address, bytecode: '0x6000' })
  expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
    {
      "factory": undefined,
      "factoryData": undefined,
    }
  `)
  await setCode(client, { address, bytecode: '0x' })
})

test('getNonce', async () => {
  const nonceKeyManager = NonceManager.from({
    source: {
      get() {
        return 69
      },
      set() {},
    },
  })
  const account = await SmartAccount.from({
    ...implementation({
      address: '0x000000000000000000000000000000000000aac4',
      nonceKeyManager,
    }),
    getNonce(options) {
      return Promise.resolve(options?.key ?? 0n)
    },
  })

  expect(
    await Promise.all([
      account.getNonce(),
      account.getNonce(),
      account.getNonce(),
    ]),
  ).toMatchInlineSnapshot(`
    [
      69n,
      70n,
      71n,
    ]
  `)
})

test('wraps counterfactual signatures', async () => {
  const address = '0x000000000000000000000000000000000000aac5'
  await setCode(client, { address, bytecode: '0x' })

  const account = await SmartAccount.from(implementation({ address }))
  const signatures = await Promise.all([
    account.sign({ hash: '0x01' }),
    account.signMessage({ message: 'hello' }),
    account.signTypedData({
      domain: {},
      message: {},
      primaryType: 'Test',
      types: { Test: [] },
    }),
  ])

  expect(signatures.map(SignatureErc6492.unwrap)).toMatchInlineSnapshot(`
    [
      {
        "data": "0xcafebabe",
        "signature": "0x1234",
        "to": "0x000000000000000000000000000000000000FAC1",
      },
      {
        "data": "0xcafebabe",
        "signature": "0x1234",
        "to": "0x000000000000000000000000000000000000FAC1",
      },
      {
        "data": "0xcafebabe",
        "signature": "0x1234",
        "to": "0x000000000000000000000000000000000000FAC1",
      },
    ]
  `)
})

test('does not wrap EIP-7702 signatures', async () => {
  const address = '0x000000000000000000000000000000000000aac6'
  await setCode(client, { address, bytecode: '0x' })

  const account = await SmartAccount.from(
    implementation({ address, factory: '0x7702' }),
  )

  await expect(
    account.signMessage({ message: 'hello' }),
  ).resolves.toMatchInlineSnapshot(`"0x1234"`)
})
