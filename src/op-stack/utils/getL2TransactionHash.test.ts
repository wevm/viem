import { expect, test } from 'vitest'
import { mainnetClient } from '~test/src/utils.js'

import { extractTransactionDepositedLogs } from './extractTransactionDepositedLogs.js'
import { getL2TransactionHash } from './getL2TransactionHash.js'

test('default', async () => {
  const log = {
    args: {
      from: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
      opaqueData:
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000520800',
      to: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
      version: 0n,
    },
    blockHash:
      '0x634c52556471c589f42db9131467e0c9484f5c73049e32d1a74e2a4ce0f91d57',
    eventName: 'TransactionDeposited',
    logIndex: 109,
  } as const

  const l2Hash = getL2TransactionHash({ log: log as any })

  expect(l2Hash).toEqual(
    '0x0a60b983815ed475c5919609025204a479654d93afc610feca7d99ae0befc329',
  )
})

test('e2e', async () => {
  const receipt = await mainnetClient.getTransactionReceipt({
    hash: '0xa08acae48f12243bccd7153c88d892673d5578cce4ee9988c0332e8bba47436b',
  })

  const [log] = extractTransactionDepositedLogs(receipt)

  const l2Hash = getL2TransactionHash({ log })

  expect(l2Hash).toEqual(
    '0x173cecf8eb5ec89d653bdd4714e4c81697ff7e9285ebf02c562e46b19dfdf424',
  )
})
