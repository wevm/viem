import { afterAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

afterAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 60_000)

test('returns zero seconds for a matured proof', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 21_890_932n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  const before = Date.now()

  const time = await Actions.l1.getTimeToFinalize(client, {
    targetChain: optimism,
    withdrawalHash:
      '0xFF78806A60996A5A656C8ED4174DD3102C388BB9BB157297482C635CDB8F973F',
  })

  expect({
    period: time.period,
    seconds: time.seconds,
    timestampCurrent: time.timestamp >= before && time.timestamp <= Date.now(),
  }).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 0,
      "timestampCurrent": true,
    }
  `)
}, 60_000)

test('rejects an unproven withdrawal', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 21_890_932n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  await expect(
    Actions.l1.getTimeToFinalize(client, {
      targetChain: optimism,
      withdrawalHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Actions.l1.getTimeToFinalize.WithdrawalNotProvenError: Withdrawal has not been proven on L1.

    Version: viem@2.52.1]
  `)
}, 60_000)

test('returns the legacy finalization period', async () => {
  const legacyClient = Client.create({
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  await CoreActions.state.reset(legacyClient, {
    blockNumber: 18_770_525n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  const before = Date.now()

  const time = await Actions.l1.getTimeToFinalize(legacyClient, {
    targetChain: optimism,
    withdrawalHash:
      '0x539dfd84b3939c6d2f61e1fbaa176a70e6a433e222093c3fea872ac36527d6ac',
  })

  expect({
    period: time.period,
    seconds: time.seconds,
    timestampCurrent: time.timestamp >= before && time.timestamp <= Date.now(),
  }).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 0,
      "timestampCurrent": true,
    }
  `)
}, 60_000)
