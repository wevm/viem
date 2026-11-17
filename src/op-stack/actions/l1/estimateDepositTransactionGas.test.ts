import { afterAll, beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { base, mainnet } from 'viem/chains'
import { Value } from 'viem/utils'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 18_136_086n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  await CoreActions.address.setBalance(client, {
    address: constants.accounts[0].address,
    value: Value.fromEther('10000'),
  })
}, 30_000)

// Instances are shared across test files; restore the default fork.
afterAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

test('estimates deposit request variants', async () => {
  const standard = await Actions.l1.estimateDepositTransactionGas(client, {
    account: constants.accounts[0].address,
    request: { gas: 21_000n, to: constants.accounts[0].address },
    targetChain: base,
  })
  const creation = await Actions.l1.estimateDepositTransactionGas(client, {
    account: constants.accounts[0].address,
    request: {
      data: '0x60006000f3',
      gas: 69_420n,
      isCreation: true,
    },
    targetChain: base,
  })
  const mint = await Actions.l1.estimateDepositTransactionGas(client, {
    account: constants.accounts[0].address,
    request: {
      gas: 21_000n,
      mint: 1n,
      to: constants.accounts[0].address,
    },
    targetChain: base,
  })

  expect({ creation, mint, standard }).toMatchInlineSnapshot(`
    {
      "creation": 99029n,
      "mint": 50879n,
      "standard": 50867n,
    }
  `)
})

test('uses an explicit portal address', async () => {
  const gas = await Actions.l1.estimateDepositTransactionGas(client, {
    account: constants.accounts[0].address,
    portalAddress: base.contracts.portal[1].address,
    request: {
      data: '0xdeadbeef',
      gas: 21_100n,
      to: constants.accounts[0].address,
    },
  })

  expect(gas).toMatchInlineSnapshot(`51151n`)
})
