import { expect, test } from 'vitest'

import { AbiEvent, AbiParameters, Address, Log } from 'viem/utils'
import { Withdrawal } from 'viem/op-stack'

test('getWithdrawalHashStorageSlot', () => {
  expect(
    Withdrawal.getWithdrawalHashStorageSlot({
      withdrawalHash:
        '0xB1C3824DEF40047847145E069BF467AA67E906611B9F5EF31515338DB0AABFA2',
    }),
  ).toMatchInlineSnapshot(
    `"0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99"`,
  )
})

test('getWithdrawals', () => {
  const sender = '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6'
  const withdrawalHash =
    '0x319fb0748049a3cffd0d3dc9ab6eff9d9fe06b38157a7183180e3d190dd2825b'
  const event = AbiEvent.from(
    'event MessagePassed(uint256 indexed nonce, address indexed sender, address indexed target, uint256 value, uint256 gasLimit, bytes data, bytes32 withdrawalHash)',
  )
  const topics = AbiEvent.encode(event, {
    nonce:
      1766847064778384329583297500742918515827483896875618958121606201292619957n,
    sender,
    target: sender,
  }).topics.map((topic) => {
    if (typeof topic !== 'string') throw new Error('Invalid event topic.')
    return topic
  })
  const logs: readonly Log.Log[] = [
    {
      address: Address.zero,
      blockHash:
        '0xd158e5a782a17617b9ca1571ec513ba1f4d49180c91e3eed3f1f44e8ac8182df',
      blockNumber: 5_659_782n,
      data: AbiParameters.encode(
        [
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'bytes' },
          { type: 'bytes32' },
        ],
        [69n, 21_000n, '0x', withdrawalHash],
      ),
      logIndex: 0,
      removed: false,
      topics,
      transactionHash:
        '0x078be3962b143952b4fd8567640b14c3682b8a941000c7d92394faf0e40cb1e8',
      transactionIndex: 1,
    },
  ]

  expect(Withdrawal.getWithdrawals({ logs })).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "gasLimit": 21000n,
        "nonce": 1766847064778384329583297500742918515827483896875618958121606201292619957n,
        "sender": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
        "target": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
        "value": 69n,
        "withdrawalHash": "0x319fb0748049a3cffd0d3dc9ab6eff9d9fe06b38157a7183180e3d190dd2825b",
      },
    ]
  `)
})
