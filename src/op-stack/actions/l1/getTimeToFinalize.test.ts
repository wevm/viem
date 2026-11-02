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

test('waits for the dispute game after the proof matures', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 21_890_932n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  const before = Date.now()

  // The proof has matured, but its dispute game is unresolved at this block
  // and its estimated resolution (`createdAt + maxClockDuration`) has passed,
  // so the remaining wait is the game finality delay.

  const time = await Actions.l1.getTimeToFinalize(client, {
    targetChain: optimism,
    withdrawalHash:
      '0xFF78806A60996A5A656C8ED4174DD3102C388BB9BB157297482C635CDB8F973F',
  })

  expect({
    period: time.period,
    seconds: time.seconds,
    timestampCurrent:
      time.timestamp >= before + time.seconds * 1000 &&
      time.timestamp <= Date.now() + time.seconds * 1000,
  }).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 302410,
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

    Version: viem@x.x.x]
  `)
}, 60_000)
