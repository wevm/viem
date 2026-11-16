import { bench, describe } from 'vitest'

import { hashTypedData } from './hashTypedData.js'

const hex = (size: number, seed = 0) =>
  `0x${Array.from({ length: size }, (_, i) => ((i * 31 + seed) & 0xff).toString(16).padStart(2, '0')).join('')}` as const

const permit = {
  domain: {
    name: 'USD Coin',
    version: '2',
    chainId: 1,
    verifyingContract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  },
  types: {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  primaryType: 'Permit',
  message: {
    owner: hex(20, 1),
    spender: hex(20, 2),
    value: 10n ** 18n,
    nonce: 0n,
    deadline: 1767225600n,
  },
} as const

const permitBatch = {
  domain: {
    name: 'Permit2',
    chainId: 1,
    verifyingContract: '0x000000000022d473030f116ddee9f6b43ac78ba3',
  },
  types: {
    PermitBatch: [
      { name: 'details', type: 'PermitDetails[]' },
      { name: 'spender', type: 'address' },
      { name: 'sigDeadline', type: 'uint256' },
    ],
    PermitDetails: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint160' },
      { name: 'expiration', type: 'uint48' },
      { name: 'nonce', type: 'uint48' },
    ],
  },
  primaryType: 'PermitBatch',
  message: {
    details: Array.from({ length: 100 }, (_, i) => ({
      token: hex(20, i),
      amount: BigInt(i + 1) * 10n ** 18n,
      expiration: 1767225600,
      nonce: i,
    })),
    spender: hex(20, 999),
    sigDeadline: 1767225600n,
  },
} as const

const seaportOrder = {
  domain: {
    name: 'Seaport',
    version: '1.6',
    chainId: 1,
    verifyingContract: '0x0000000000000068f116a894984e2db1123eb395',
  },
  types: {
    OrderComponents: [
      { name: 'offerer', type: 'address' },
      { name: 'zone', type: 'address' },
      { name: 'offer', type: 'OfferItem[]' },
      { name: 'consideration', type: 'ConsiderationItem[]' },
      { name: 'orderType', type: 'uint8' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'zoneHash', type: 'bytes32' },
      { name: 'salt', type: 'uint256' },
      { name: 'conduitKey', type: 'bytes32' },
      { name: 'counter', type: 'uint256' },
    ],
    OfferItem: [
      { name: 'itemType', type: 'uint8' },
      { name: 'token', type: 'address' },
      { name: 'identifierOrCriteria', type: 'uint256' },
      { name: 'startAmount', type: 'uint256' },
      { name: 'endAmount', type: 'uint256' },
    ],
    ConsiderationItem: [
      { name: 'itemType', type: 'uint8' },
      { name: 'token', type: 'address' },
      { name: 'identifierOrCriteria', type: 'uint256' },
      { name: 'startAmount', type: 'uint256' },
      { name: 'endAmount', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
  },
  primaryType: 'OrderComponents',
  message: {
    offerer: hex(20, 1),
    zone: hex(20, 2),
    offer: [0, 1].map((i) => ({
      itemType: 2,
      token: hex(20, 10 + i),
      identifierOrCriteria: BigInt(i),
      startAmount: 1n,
      endAmount: 1n,
    })),
    consideration: Array.from({ length: 100 }, (_, i) => ({
      itemType: 1,
      token: hex(20, 100 + (i % 50)),
      identifierOrCriteria: 0n,
      startAmount: BigInt(i + 1) * 10n ** 15n,
      endAmount: BigInt(i + 1) * 10n ** 15n,
      recipient: hex(20, 200 + i),
    })),
    orderType: 0,
    startTime: 1735689600n,
    endTime: 1767225600n,
    zoneHash: hex(32, 3),
    salt: 123456789n,
    conduitKey: hex(32, 4),
    counter: 0n,
  },
} as const

describe('hashTypedData', () => {
  bench('EIP-2612 Permit', () => {
    hashTypedData(permit)
  })

  bench('Permit2 PermitBatch, 100 details', () => {
    hashTypedData(permitBatch)
  })

  bench('Seaport order, 100 consideration items', () => {
    hashTypedData(seaportOrder)
  })
})
