import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { mainnet } from '../../chains/index.js'

import { buildInitiateWithdrawal } from './buildInitiateWithdrawal.js'
import { initiateWithdrawal } from './initiateWithdrawal.js'

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({
  account: accounts[0].address,
})

test('default', async () => {
  const request = await buildInitiateWithdrawal(client, {
    to: accounts[1].address,
  })
  expect(request).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "request": {
        "data": undefined,
        "gas": 21000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": undefined,
      },
    }
  `)

  const hash = await initiateWithdrawal(clientWithAccount, request)
  expect(hash).toBeDefined()
})

test('args: account', async () => {
  const request = await buildInitiateWithdrawal(client, {
    account: accounts[0].address,
    to: accounts[1].address,
  })
  expect(request).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      },
      "request": {
        "data": undefined,
        "gas": 21000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": undefined,
      },
    }
  `)

  const hash = await initiateWithdrawal(clientWithAccount, request)
  expect(hash).toBeDefined()
})

test('args: chain', async () => {
  const request = await buildInitiateWithdrawal(client, {
    account: accounts[0].address,
    chain: mainnet,
    to: accounts[1].address,
  })
  expect(request).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      },
      "request": {
        "data": undefined,
        "gas": 21000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": undefined,
      },
    }
  `)

  const hash = await initiateWithdrawal(clientWithAccount, request)
  expect(hash).toBeDefined()
})

test('args: data', async () => {
  const request = await buildInitiateWithdrawal(client, {
    account: accounts[0].address,
    data: '0xdeadbeef',
    to: accounts[1].address,
  })
  expect(request).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      },
      "request": {
        "data": "0xdeadbeef",
        "gas": 21064n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": undefined,
      },
    }
  `)

  const hash = await initiateWithdrawal(clientWithAccount, request)
  expect(hash).toBeDefined()
})

test('args: gas', async () => {
  const request = await buildInitiateWithdrawal(client, {
    account: accounts[0].address,
    gas: 100_000n,
    to: accounts[1].address,
  })
  expect(request).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      },
      "request": {
        "data": undefined,
        "gas": 100000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": undefined,
      },
    }
  `)

  const hash = await initiateWithdrawal(clientWithAccount, request)
  expect(hash).toBeDefined()
})

test('args: value', async () => {
  const request = await buildInitiateWithdrawal(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: 1n,
  })
  expect(request).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      },
      "request": {
        "data": undefined,
        "gas": 21000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1n,
      },
    }
  `)

  const hash = await initiateWithdrawal(clientWithAccount, request)
  expect(hash).toBeDefined()
})
