import { expect, test } from 'vitest'

import { getSignature } from './getSignature'

test('creates function signature', () => {
  expect(getSignature('_compound(uint256,uint256,uint256)')).toEqual(
    '0xf4fbb312',
  )
  expect(
    getSignature('function _compound(uint256 a, uint256 b, uint256 c)'),
  ).toEqual('0xf4fbb312')
  expect(getSignature('function ownerOf(uint256 tokenId)')).toEqual(
    '0x6352211e',
  )
  expect(getSignature('ownerOf(uint256)')).toEqual('0x6352211e')
  expect(getSignature('processInvestment(address,uint256,bool)')).toEqual(
    '0xcf4b8f61',
  )
  expect(getSignature('processAccount(uint256 , address )')).toEqual(
    '0x73933128',
  )
})
