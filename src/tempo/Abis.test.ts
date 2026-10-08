import { expect, test } from 'vitest'
import * as Abis from './Abis.js'

test('groups Tempo, Earn, Zone, and PropAMM ABIs', () => {
  expect(Abis.core).toContain(Abis.accountKeychain[0])
  expect(Abis.core).toContain(Abis.keyPublisher[0])
  expect(Abis.core).toContain(Abis.zonePortal[0])
  expect(Abis.earn).toContain(Abis.earnContributionController[0])
  expect(Abis.earn).toContain(Abis.vedaEngine[0])
  expect(Abis.earn).not.toContain(Abis.earnRouterCallbackData[0])
  expect(Abis.zone).toContain(Abis.zoneOutbox[0])
  expect(Abis.zone).toContain(Abis.zoneInbox[0])
  expect(Abis.propAmm).toEqual(Abis.directPropAmm)
  expect(Abis.all as readonly unknown[]).toEqual([
    ...(Abis.core as readonly unknown[]),
    ...(Abis.earn as readonly unknown[]),
    ...(Abis.zone as readonly unknown[]),
    ...(Abis.propAmm as readonly unknown[]),
  ])
})

test('exposes current ZoneInbox deposit outcomes', () => {
  expect(
    Abis.zoneInbox
      .filter((item) => item.type === 'event')
      .map((item) => item.name),
  ).toEqual([
    'TempoAdvanced',
    'TempoAdvanced',
    'DepositProcessed',
    'DepositFailed',
    'DepositRejected',
    'WithdrawalBounceBackProcessed',
    'WithdrawalBounceBackPending',
    'RefundClaimed',
    'TokenEnabled',
  ])
  expect(Abis.zoneInbox).toContainEqual({
    name: 'DepositFailed',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'depositHash', indexed: true },
      { type: 'address', name: 'sender', indexed: true },
      { type: 'address', name: 'token' },
      { type: 'uint128', name: 'amount' },
    ],
  })
  expect(Abis.zoneInbox).toContainEqual({
    name: 'DepositRejected',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'depositHash', indexed: true },
      { type: 'address', name: 'sender', indexed: true },
      { type: 'uint8', name: 'depositType' },
      { type: 'address', name: 'token' },
      { type: 'uint128', name: 'amount' },
      { type: 'address', name: 'tempoRefundRecipient' },
    ],
  })
})

test('preserves Tempo ABI items when merging Zone ABIs', () => {
  expect(Abis.zoneFactory).toContainEqual({
    name: 'zones',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'uint32', name: 'id' }],
    outputs: [
      expect.objectContaining({
        type: 'tuple',
        name: 'info',
      }),
    ],
  })
  expect(Abis.zonePortal).toContainEqual({
    name: 'LeaderUpdated',
    type: 'event',
    inputs: [
      { type: 'address', name: 'previousLeader', indexed: true },
      { type: 'address', name: 'newLeader', indexed: true },
      { type: 'uint64', name: 'leaderEpoch', indexed: true },
      { type: 'uint64', name: 'leaderActivationTempoBlock' },
    ],
  })
})

test('includes the sequencer encryption key address', () => {
  expect(Abis.zonePortal).toContainEqual({
    name: 'sequencerEncryptionKey',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { type: 'bytes32', name: 'x' },
      { type: 'uint8', name: 'yParity' },
      { type: 'address', name: 'pubkey' },
    ],
  })
})
