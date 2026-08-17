import { expect, test } from 'vitest'

import { AbiEvent, AbiParameters, Address } from 'viem/utils'
import { Deposit } from 'viem/op-stack'

test('getSourceHash', () => {
  const l1BlockHash =
    '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7'

  expect([
    Deposit.getSourceHash({
      domain: 'userDeposit',
      l1BlockHash,
      l1LogIndex: 196,
    }),
    Deposit.getSourceHash({
      domain: 'l1InfoDeposit',
      l1BlockHash,
      sequenceNumber: 1,
    }),
    Deposit.getSourceHash({
      domain: 'upgradeDeposit',
      intent: 'Interop: CrossL2Inbox Proxy Update',
    }),
  ]).toMatchInlineSnapshot(`
    [
      "0xd0868c8764d81f1749edb7dec4a550966963540d9fe50aefce8cdb38ea7b2213",
      "0x722c43232e2f9dc07ebc07a02a3056993a2ed1328a1c81377ea99d135af39536",
      "0x88c6b48354c367125a59792a93a7b60ad7cd66e516157dbba16558c68a46d3cb",
    ]
  `)
})

test('opaqueDataToDepositData', () => {
  const opaqueData = AbiParameters.encodePacked(
    ['uint256', 'uint256', 'uint64', 'bool', 'bytes'],
    [420n, 69n, 21_100n, true, '0xdeadbeef'],
  )

  expect(Deposit.opaqueDataToDepositData(opaqueData)).toMatchInlineSnapshot(`
    {
      "data": "0xdeadbeef",
      "gas": 21100n,
      "isCreation": true,
      "mint": 420n,
      "value": 69n,
    }
  `)
})

test('getL2TransactionHash', () => {
  const from = '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6'
  const opaqueData =
    '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000520800'
  const event = AbiEvent.from(
    'event TransactionDeposited(address indexed from, address indexed to, uint256 indexed version, bytes opaqueData)',
  )
  const topics = AbiEvent.encode(event, {
    from,
    to: from,
    version: 0n,
  }).topics.map((topic) => {
    if (typeof topic !== 'string') throw new Error('Invalid event topic.')
    return topic
  })
  const [log] = Deposit.extractTransactionDepositedLogs({
    logs: [
      {
        address: Address.zero,
        blockHash:
          '0x634c52556471c589f42db9131467e0c9484f5c73049e32d1a74e2a4ce0f91d57',
        blockNumber: 1n,
        data: AbiParameters.encode([{ type: 'bytes' }], [opaqueData]),
        logIndex: 109,
        removed: false,
        topics,
        transactionHash:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        transactionIndex: 0,
      },
    ],
  })
  if (!log) throw new Error('Transaction deposit log not found.')

  expect(Deposit.getL2TransactionHash({ log })).toMatchInlineSnapshot(
    `"0x0a60b983815ed475c5919609025204a479654d93afc610feca7d99ae0befc329"`,
  )
})
