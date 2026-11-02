import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import {
  Actions as CoreActions,
  Client,
  Errors as CoreErrors,
  http,
} from 'viem'
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

test('does not share cached results across Clients', async () => {
  // The portal is deployed on the `anvil.mainnet` fork only.
  const other = Client.create({
    chain: mainnet,
    transport: http(anvil.local.rpcUrl.http),
  })

  await Actions.l1.getPortalVersion(client, { targetChain: optimism })

  await expect(
    Actions.l1.getPortalVersion(other, { targetChain: optimism }),
  ).rejects.toThrowError(CoreErrors.BaseError)
})
