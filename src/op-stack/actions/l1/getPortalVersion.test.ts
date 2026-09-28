import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 60_000)

test('returns the deployed portal version', async () => {
  const version = await Actions.l1.getPortalVersion(client, {
    targetChain: optimism,
  })

  expect(version).toMatchInlineSnapshot(`
    {
      "major": 5,
      "minor": 1,
      "patch": 1,
    }
  `)
})

test('accepts an explicit portal address', async () => {
  const version = await Actions.l1.getPortalVersion(client, {
    portalAddress: optimism.contracts.portal[1].address,
  })

  expect(version).toMatchInlineSnapshot(`
    {
      "major": 5,
      "minor": 1,
      "patch": 1,
    }
  `)
})
