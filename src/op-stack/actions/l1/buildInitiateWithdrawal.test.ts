import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Account, Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})
const clientWithAccount = Client.create({
  account: constants.accounts[0].address,
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})
const optimismClient = Client.create({
  chain: optimism,
  transport: http(anvil.optimism.rpcUrl.http),
})
const optimismClientWithAccount = Client.create({
  account: constants.accounts[0].address,
  chain: optimism,
  transport: http(anvil.optimism.rpcUrl.http),
})
const clientWithoutChain = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
})
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test

beforeAll(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return

  await Promise.all([
    CoreActions.state.reset(client, {
      blockNumber: anvil.mainnet.forkBlockNumber,
      jsonRpcUrl: anvil.mainnet.forkUrl,
    }),
    CoreActions.state.reset(optimismClient, {
      blockNumber: anvil.optimism.forkBlockNumber,
      jsonRpcUrl: optimism.rpcUrls.default.http[0],
    }),
  ])
  await Promise.all(
    constants.accounts.map(({ address }) =>
      CoreActions.address.setCode(client, { address, bytecode: '0x' }),
    ),
  )
}, 60_000)

liveTest('default', { timeout: 60_000 }, async () => {
  const result = await Actions.l1.buildInitiateWithdrawal(client, {
    to: constants.accounts[1].address,
  })
  expect(result).toMatchInlineSnapshot(`
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

  const hash = await Actions.l2.initiateWithdrawal(
    optimismClientWithAccount,
    result,
  )
  expect(hash).toMatch(/^0x[\da-f]{64}$/)
})

liveTest('ignores the client account while preparing', async () => {
  const to = '0x0000000000000000000000000000000000001000'
  await CoreActions.address.setCode(client, {
    address: to,
    bytecode: '0x3315600a5760006000fd5b00',
  })

  const result = await Actions.l1.buildInitiateWithdrawal(clientWithAccount, {
    to,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "request": {
        "data": undefined,
        "gas": 21019n,
        "to": "0x0000000000000000000000000000000000001000",
        "value": undefined,
      },
    }
  `)
})

liveTest('args: account', async () => {
  const result = await Actions.l1.buildInitiateWithdrawal(client, {
    account: constants.accounts[0].address,
    to: constants.accounts[1].address,
  })
  expect(result).toMatchInlineSnapshot(`
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

  const hash = await Actions.l2.initiateWithdrawal(
    optimismClientWithAccount,
    result,
  )
  expect(hash).toMatch(/^0x[\da-f]{64}$/)
})

liveTest('args: local account', async () => {
  const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
  const result = await Actions.l1.buildInitiateWithdrawal(client, {
    account,
    to: constants.accounts[1].address,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "keyType": "secp256k1",
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
        "signAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "type": "local",
      },
      "request": {
        "data": undefined,
        "gas": 21000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": undefined,
      },
    }
  `)

  const hash = await Actions.l2.initiateWithdrawal(optimismClient, result)
  expect(hash).toMatch(/^0x[\da-f]{64}$/)
})

liveTest('args: chain', async () => {
  const result = await Actions.l1.buildInitiateWithdrawal(clientWithoutChain, {
    account: constants.accounts[0].address,
    chain: mainnet,
    to: constants.accounts[1].address,
  })
  expect(result).toMatchInlineSnapshot(`
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

  const hash = await Actions.l2.initiateWithdrawal(
    optimismClientWithAccount,
    result,
  )
  expect(hash).toMatch(/^0x[\da-f]{64}$/)
})

liveTest('args: data', async () => {
  const result = await Actions.l1.buildInitiateWithdrawal(client, {
    account: constants.accounts[0].address,
    data: '0xdeadbeef',
    to: constants.accounts[1].address,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      },
      "request": {
        "data": "0xdeadbeef",
        "gas": 21160n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": undefined,
      },
    }
  `)

  const hash = await Actions.l2.initiateWithdrawal(
    optimismClientWithAccount,
    result,
  )
  expect(hash).toMatch(/^0x[\da-f]{64}$/)
})

liveTest('args: gas', async () => {
  const result = await Actions.l1.buildInitiateWithdrawal(client, {
    account: constants.accounts[0].address,
    gas: 100_000n,
    to: constants.accounts[1].address,
  })
  expect(result).toMatchInlineSnapshot(`
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

  const hash = await Actions.l2.initiateWithdrawal(
    optimismClientWithAccount,
    result,
  )
  expect(hash).toMatch(/^0x[\da-f]{64}$/)
})

liveTest('args: value', async () => {
  const result = await Actions.l1.buildInitiateWithdrawal(client, {
    account: constants.accounts[0].address,
    to: constants.accounts[1].address,
    value: 1n,
  })
  expect(result).toMatchInlineSnapshot(`
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

  const hash = await Actions.l2.initiateWithdrawal(
    optimismClientWithAccount,
    result,
  )
  expect(hash).toMatch(/^0x[\da-f]{64}$/)
})

test('errors: invalid account', async () => {
  await expect(
    Actions.l1.buildInitiateWithdrawal(client, {
      account: '0x1',
      to: constants.accounts[1].address,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Address.InvalidAddressError: Address "0x1" is invalid.

    Details: Address is not a 20 byte (40 hexadecimal character) value.]
  `)
})
