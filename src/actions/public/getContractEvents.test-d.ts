import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getContractEvents } from './getContractEvents.js'

const client = anvilMainnet.getClient()

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      { indexed: true, name: 'to', type: 'address' },
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as const

test('args: abi', async () => {
  const logs = await getContractEvents(client, {
    abi: abi,
    args: {},
    strict: true,
  })

  expectTypeOf(logs[0].eventName).toEqualTypeOf<
    'Approval' | 'ApprovalForAll' | 'Transfer'
  >()
  expectTypeOf(logs[0].eventName === 'Approval' && logs[0].args).toEqualTypeOf<
    false | { owner: `0x${string}`; approved: `0x${string}`; tokenId: bigint }
  >()
  expectTypeOf(
    logs[0].eventName === 'ApprovalForAll' && logs[0].args,
  ).toEqualTypeOf<
    false | { owner: `0x${string}`; operator: `0x${string}`; approved: boolean }
  >()
  expectTypeOf(logs[0].eventName === 'Transfer' && logs[0].args).toEqualTypeOf<
    false | { from: `0x${string}`; to: `0x${string}`; tokenId: bigint }
  >()
})

test('args: abi, eventName', async () => {
  const logs = await getContractEvents(client, {
    abi,
    eventName: 'Transfer',
    args: {
      from: '0x',
    },
    strict: true,
  })

  expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0].args).toEqualTypeOf<{
    from: `0x${string}`
    to: `0x${string}`
    tokenId: bigint
  }>()
})
