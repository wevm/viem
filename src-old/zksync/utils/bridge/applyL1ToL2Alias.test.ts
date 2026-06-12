import { expect, test } from 'vitest'
import { applyL1ToL2Alias } from './applyL1ToL2Alias.js'

test('default', async () => {
  const l1ContractAddress = '0x702942B8205E5dEdCD3374E5f4419843adA76Eeb'
  const l2ContractAddress = applyL1ToL2Alias(l1ContractAddress)
  expect(l2ContractAddress.toLowerCase()).equals(
    '0x813A42B8205E5DedCd3374e5f4419843ADa77FFC'.toLowerCase(),
  )
})

test('pad zero to left', async () => {
  const l1ContractAddress = '0xeeeeffffffffffffffffffffffffffffffffeeef'
  const l2ContractAddress = applyL1ToL2Alias(l1ContractAddress)
  expect(l2ContractAddress.toLowerCase()).equals(
    '0x0000000000000000000000000000000000000000'.toLowerCase(),
  )
})
