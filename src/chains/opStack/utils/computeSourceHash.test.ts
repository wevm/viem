import { expect, test } from 'vitest'
import { computeSourceHash } from './computeSourceHash.js'

test('userDeposit', () => {
  const sourceHash = computeSourceHash({
    domain: 'userDeposit',
    l1LogIndex: 196,
    l1BlockHash:
      '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7',
  })
  expect(sourceHash).toEqual(
    '0xd0868c8764d81f1749edb7dec4a550966963540d9fe50aefce8cdb38ea7b2213',
  )
})

test('l1InfoDeposit', () => {
  const sourceHash = computeSourceHash({
    domain: 'l1InfoDeposit',
    sequenceNumber: 1,
    l1BlockHash:
      '0x9ba3933dc6ce43c145349770a39c30f9b647f17668f004bd2e05c80a2e7262f7',
  })
  expect(sourceHash).toEqual(
    '0x722c43232e2f9dc07ebc07a02a3056993a2ed1328a1c81377ea99d135af39536',
  )
})
