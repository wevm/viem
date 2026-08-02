import { expect, test } from 'vitest'

import { Account, Actions, testActions } from 'viem'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const account = Account.fromPrivateKey(constants.accounts[0].privateKey)

const { address } = await contract.deploy(client, {
  bytecode: generated.Erc7821Example.bytecode.object,
})

test('default', async () => {
  expect(
    await Actions.erc7821.supportsExecutionMode(client, {
      address,
    }),
  ).toBe(true)
  expect(
    await Actions.erc7821.supportsExecutionMode(client, {
      address: account.address,
    }),
  ).toBe(false)

  const authorization = await Actions.wallet.signAuthorization(client, {
    account,
    address,
    executor: 'self',
  })
  await Actions.transaction.send(client, {
    account,
    authorizationList: [authorization],
    to: account.address,
  })

  await testClient.block.mine({ blocks: 1 })

  expect(
    await Actions.erc7821.supportsExecutionMode(client, {
      address: account.address,
    }),
  ).toBe(true)
})

test('args: mode = opData', async () => {
  expect(
    await Actions.erc7821.supportsExecutionMode(client, {
      address,
      mode: 'opData',
    }),
  ).toBe(true)
})

test('args: mode = batchOfBatches', async () => {
  expect(
    await Actions.erc7821.supportsExecutionMode(client, {
      address,
      mode: 'batchOfBatches',
    }),
  ).toBe(true)
})

test('args: mode (hex)', async () => {
  expect(
    await Actions.erc7821.supportsExecutionMode(client, {
      address,
      mode: '0x0100000000007821000200000000000000000000000000000000000000000000',
    }),
  ).toBe(true)
})
