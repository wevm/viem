import { expect, test } from 'vitest'

import { getFunctionSignature } from './getFunctionSignature'

test('creates function signature', () => {
  expect(getFunctionSignature('_compound(uint256,uint256,uint256)')).toEqual(
    '0xf4fbb312',
  )
  expect(
    getFunctionSignature('function _compound(uint256 a, uint256 b, uint256 c)'),
  ).toEqual('0xf4fbb312')
  expect(getFunctionSignature('function ownerOf(uint256 tokenId)')).toEqual(
    '0x6352211e',
  )
  expect(getFunctionSignature('ownerOf(uint256)')).toEqual('0x6352211e')
  expect(
    getFunctionSignature('processInvestment(address,uint256,bool)'),
  ).toEqual('0xcf4b8f61')
  expect(getFunctionSignature('processAccount(uint256 , address )')).toEqual(
    '0x73933128',
  )
})
