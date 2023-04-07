import { expect, test } from 'vitest'

import { getFunctionSelector } from './getFunctionSelector.js'

test('creates function signature', () => {
  expect(getFunctionSelector('_compound(uint256,uint256,uint256)')).toEqual(
    '0xf4fbb312',
  )
  expect(
    getFunctionSelector('function _compound(uint256 a, uint256 b, uint256 c)'),
  ).toEqual('0xf4fbb312')
  expect(getFunctionSelector('function ownerOf(uint256 tokenId)')).toEqual(
    '0x6352211e',
  )
  expect(getFunctionSelector('ownerOf(uint256)')).toEqual('0x6352211e')
  expect(
    getFunctionSelector('processInvestment(address,uint256,bool)'),
  ).toEqual('0xcf4b8f61')
  expect(getFunctionSelector('processAccount(uint256 , address )')).toEqual(
    '0x73933128',
  )
})
