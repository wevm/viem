import { expect, test } from 'vitest'
import { undoL1ToL2Alias } from './undoL1ToL2Alias.js'

test('default', async () => {
  const l2ContractAddress = '0x813A42B8205E5DedCd3374e5f4419843ADa77FFC'
  const l1ContractAddress = undoL1ToL2Alias(l2ContractAddress)
  expect(l1ContractAddress.toLowerCase()).equals(
    '0x702942B8205E5dEdCD3374E5f4419843adA76Eeb'.toLowerCase(),
  )
})

test('pad zero to left', async () => {
  const l2ContractAddress = '0x1111000000000000000000000000000000001111'
  const l1ContractAddress = undoL1ToL2Alias(l2ContractAddress)
  expect(l1ContractAddress.toLowerCase()).equals(
    '0x0000000000000000000000000000000000000000'.toLowerCase(),
  )
})

test('offset is greater than the address', async () => {
  const l2ContractAddress = '0x100'
  const l1ContractAddress = undoL1ToL2Alias(l2ContractAddress)

  expect(l1ContractAddress.toLowerCase()).equals(
    '0xeeeeffffffffffffffffffffffffffffffffefef'.toLowerCase(),
  )
})
